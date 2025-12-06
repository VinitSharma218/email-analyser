import type { AnalysisResult } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    ShieldCheck, 
    ShieldAlert, 
    ShieldQuestion, 
    Shield, 
    Link as LinkIcon, 
    Globe, 
    Server,
    ExternalLink
} from 'lucide-react';
import type { AuthResult } from '@/lib/parser';
import { Button } from '@/components/ui/button';

const AuthStatusIndicator = ({ status }: { status: AuthResult }) => {
    switch (status) {
      case 'pass':
        return <ShieldCheck className="h-5 w-5 text-success" />;
      case 'fail':
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'neutral':
        return <ShieldQuestion className="h-5 w-5 text-warning" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
};

const getBadgeVariant = (status: AuthResult): 'success' | 'destructive' | 'secondary' => {
    switch (status) {
        case 'pass':
            return 'success';
        case 'fail':
            return 'destructive';
        default:
            return 'secondary';
    }
}

export default function AnalysisResults({ result }: { result: AnalysisResult }) {
  const { securitySummary, authResults, links, domains, ips } = result;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Security Summary</CardTitle>
          <CardDescription>AI-powered insights into potential risks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{securitySummary}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Authentication Results</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">SPF</h3>
                    <AuthStatusIndicator status={authResults.spf.result} />
                    <Badge variant={getBadgeVariant(authResults.spf.result)} className="mt-2">{authResults.spf.result}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 truncate w-full" title={authResults.spf.from}>From: {authResults.spf.from}</p>
                </div>
                 <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">DKIM</h3>
                    <AuthStatusIndicator status={authResults.dkim.result} />
                    <Badge variant={getBadgeVariant(authResults.dkim.result)} className="mt-2">{authResults.dkim.result}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 truncate w-full" title={authResults.dkim.domain}>Domain: {authResults.dkim.domain}</p>
                </div>
                 <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">DMARC</h3>
                    <AuthStatusIndicator status={authResults.dmarc.result} />
                    <Badge variant={getBadgeVariant(authResults.dmarc.result)} className="mt-2">{authResults.dmarc.result}</Badge>
                     <p className="text-xs text-muted-foreground mt-1 truncate w-full" title={authResults.dmarc.domain}>Domain: {authResults.dmarc.domain}</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="links">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4" />Links ({links.length})</TabsTrigger>
                    <TabsTrigger value="domains"><Globe className="mr-2 h-4 w-4" />Domains ({domains.length})</TabsTrigger>
                    <TabsTrigger value="ips"><Server className="mr-2 h-4 w-4" />IP Addresses ({ips.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="links" className="mt-4">
                    <DataTable data={links} type="link" />
                </TabsContent>
                <TabsContent value="domains" className="mt-4">
                     <DataTable data={domains} type="domain" />
                </TabsContent>
                <TabsContent value="ips" className="mt-4">
                     <DataTable data={ips} type="ip" />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const DataTable = ({ data, type }: { data: string[], type: 'link' | 'domain' | 'ip' }) => {
    if (data.length === 0) {
        return <p className="text-muted-foreground text-center py-4">No {type}s found.</p>;
    }
    return (
        <div className="max-h-96 overflow-y-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{type.charAt(0).toUpperCase() + type.slice(1)}</TableHead>
                        {type !== 'link' && <TableHead className="text-right w-[100px]">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-mono text-sm break-all">{item}</TableCell>
                        {type === 'domain' && (
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`https://www.virustotal.com/gui/domain/${item}`} target="_blank" rel="noopener noreferrer" title="Check on VirusTotal">
                                      <ExternalLink className="h-4 w-4 text-primary/80"/>
                                  </a>
                                </Button>
                            </TableCell>
                        )}
                        {type === 'ip' && (
                             <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`https://www.virustotal.com/gui/ip-address/${item}`} target="_blank" rel="noopener noreferrer" title="Check on VirusTotal">
                                      <ExternalLink className="h-4 w-4 text-primary/80"/>
                                  </a>
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
};
