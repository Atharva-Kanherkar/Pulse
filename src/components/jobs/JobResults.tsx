// src/components/jobs/JobResults.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Copy, 
  Calendar,
  Users,
  Code,
  MessageSquare,
  Bot,
  CheckCircle2
} from 'lucide-react';

interface JobResultsProps {
  results: Record<string, any>;
}

export function JobResults({ results }: JobResultsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resultEntries = Object.entries(results).filter(([key, value]) => 
    value && key !== 'final_briefing'
  );

  const finalBriefing = results.final_briefing || results.coordinator;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Meeting Preparation Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        {finalBriefing && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-900">Final Briefing</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(finalBriefing, 'final_briefing')}
                >
                  {copiedKey === 'final_briefing' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAsFile(finalBriefing, 'meeting-briefing.txt')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-white p-3 rounded border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {finalBriefing}
              </pre>
            </div>
          </div>
        )}

        {resultEntries.length > 0 && (
          <Tabs defaultValue={resultEntries[0][0]} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              {resultEntries.map(([key]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {key === 'calendar' && <Calendar className="h-3 w-3 mr-1" />}
                  {key === 'people_research' && <Users className="h-3 w-3 mr-1" />}
                  {key === 'technical_context' && <Code className="h-3 w-3 mr-1" />}
                  {key === 'slack_context' && <MessageSquare className="h-3 w-3 mr-1" />}
                  {key === 'coordinator' && <Bot className="h-3 w-3 mr-1" />}
                  {key === 'agenda' && <FileText className="h-3 w-3 mr-1" />}
                  {key.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>

            {resultEntries.map(([key, value]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">
                    {key.replace('_', ' ')} Results
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(
                        typeof value === 'string' ? value : JSON.stringify(value, null, 2),
                        key
                      )}
                    >
                      {copiedKey === key ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(
                        typeof value === 'string' ? value : JSON.stringify(value, null, 2),
                        `${key}-results.${typeof value === 'string' ? 'txt' : 'json'}`
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-y-auto">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
