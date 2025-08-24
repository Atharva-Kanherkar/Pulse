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
  CheckCircle2,
  Eye,
  Code2
} from 'lucide-react';

interface JobResultsProps {
  results: Record<string, any>;
}

export function JobResults({ results }: JobResultsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'formatted' | 'raw'>>({});

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

  const toggleViewMode = (key: string) => {
    setViewModes(prev => ({
      ...prev,
      [key]: prev[key] === 'formatted' ? 'raw' : 'formatted'
    }));
  };

  const formatValue = (value: any): { formatted: string; raw: string; isJson: boolean } => {
    if (typeof value === 'string') {
      // Check if string contains JSON
      try {
        const parsed = JSON.parse(value);
        return {
          formatted: JSON.stringify(parsed, null, 2),
          raw: value,
          isJson: true
        };
      } catch {
        // Not JSON, return as is
        return {
          formatted: value,
          raw: value,
          isJson: false
        };
      }
    } else if (typeof value === 'object' && value !== null) {
      const jsonString = JSON.stringify(value, null, 2);
      return {
        formatted: jsonString,
        raw: jsonString,
        isJson: true
      };
    } else {
      const stringValue = String(value);
      return {
        formatted: stringValue,
        raw: stringValue,
        isJson: false
      };
    }
  };

  const renderJsonWithHighlighting = (jsonString: string) => {
    // Simple JSON syntax highlighting
    return jsonString
      .replace(/(".*?")\s*:/g, '<span class="text-blue-600 font-semibold">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-green-600">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-purple-600">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-orange-600">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-red-500">$1</span>');
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
            <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                  {finalBriefing}
                </pre>
              </div>
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

            {resultEntries.map(([key, value]) => {
              const { formatted, raw, isJson } = formatValue(value);
              const currentViewMode = viewModes[key] || 'formatted';
              const displayContent = currentViewMode === 'formatted' ? formatted : raw;
              
              return (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold capitalize">
                        {key.replace('_', ' ')} Results
                      </h3>
                      {isJson && (
                        <Badge variant="secondary" className="text-xs">
                          JSON
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isJson && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleViewMode(key)}
                          className="text-xs"
                        >
                          {currentViewMode === 'formatted' ? (
                            <>
                              <Code2 className="h-3 w-3 mr-1" />
                              Raw
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Pretty
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(displayContent, key)}
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
                          displayContent,
                          `${key}-results.${isJson ? 'json' : 'txt'}`
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border rounded-lg">
                    <div className="max-h-96 overflow-y-auto">
                      {isJson && currentViewMode === 'formatted' ? (
                        <div 
                          className="p-4 text-sm font-mono leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: renderJsonWithHighlighting(displayContent)
                          }}
                        />
                      ) : (
                        <pre className="p-4 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap">
                          {displayContent}
                        </pre>
                      )}
                    </div>
                    {isJson && (
                      <div className="px-4 py-2 bg-gray-100 border-t text-xs text-gray-600 flex items-center justify-between">
                        <span>
                          {currentViewMode === 'formatted' ? 'Formatted JSON' : 'Raw JSON'}
                        </span>
                        <span>
                          {displayContent.split('\n').length} lines
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}