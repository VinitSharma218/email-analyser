'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { analyzeHeaderAction, type AnalysisResult } from '@/app/actions';
import AnalysisResults from './analysis-results';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  header: z.string().min(10, {
    message: 'Header must be at least 10 characters.',
  }),
});

export default function HeaderAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      header: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    
    const result = await analyzeHeaderAction(values.header);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
      setAnalysisResult(null);
    } else if (result.data) {
      setAnalysisResult(result.data);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Email Header / .eml Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your email header here..."
                        className="min-h-[250px] font-code text-sm bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Header'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {analysisResult && (
        <div className="animate-in fade-in-50 duration-500">
          <AnalysisResults result={analysisResult} />
        </div>
      )}
    </div>
  );
}
