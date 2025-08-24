import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Code2,
  Clock,
  MapPin,
  Video,
  Mail,
  User,
  Building2,
  GraduationCap,
  Star,
  AlertCircle,
  Link,
  ExternalLink,
  Target,
  Timer,
  CheckSquare,
  BookOpen,
  Database,
  Github,
  FileCode,
  Palette,
  Sparkles
} from 'lucide-react';

interface JobResultsProps {
  results: Record<string, any>;
}

interface CalendarEvent {
  kind: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: Array<{
    email: string;
    organizer?: boolean;
    responseStatus: string;
    optional?: boolean;
    self?: boolean;
  }>;
  hangoutLink?: string;
  htmlLink: string;
  status: string;
}

interface AttendeeProfile {
  email: string;
  name: string;
  role?: string;
  roles?: string[];
  organization?: string;
  organizations?: string[];
  background?: string;
  expertise?: string;
  context?: string;
  social_media?: any;
  websites?: string[];
}

interface AgendaItem {
  title: string;
  description: string;
  priority: string;
  time_allocation: string;
  stakeholders: string[];
  context: string;
}

interface PrereadDocument {
  title: string;
  type: string;
  source: string;
  relevance_score: number;
  summary: string;
  key_points: string[];
  link: string;
  last_updated: string;
}

export function JobResults({ results }: JobResultsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'visual' | 'raw'>>({});

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
      [key]: prev[key] === 'visual' ? 'raw' : 'visual'
    }));
  };

  // Universal markdown cleaning function
  const cleanMarkdownResponse = (response: string): string => {
    if (typeof response !== 'string') return response;
    
    let cleaned = response.trim();
    
    // Remove various markdown code block formats
    cleaned = cleaned.replace(/^```[\w]*\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.replace(/^`([^`]+)`$/, '$1');
    
    // Remove markdown headers at the start if they exist
    cleaned = cleaned.replace(/^#+\s*/, '');
    
    return cleaned.trim();
  };

  // Try to parse JSON with fallback
  const safeJSONParse = (data: string, fallback: any = null) => {
    try {
      const cleaned = cleanMarkdownResponse(data);
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse JSON:', e);
      return fallback;
    }
  };

  const parseCalendarData = (data: any): CalendarEvent[] => {
    console.log('Parsing calendar data:', data);
    
    // Handle direct array format (your current format)
    if (Array.isArray(data)) {
      return data.map(transformCalendarEvent);
    }
    
    // Handle string data
    if (typeof data === 'string') {
      const parsed = safeJSONParse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(transformCalendarEvent);
      }
      
      if (parsed?.meetings && Array.isArray(parsed.meetings)) {
        return parsed.meetings.map(transformCalendarEvent);
      }
      
      // Fallback: try to extract meeting info from plain text
      return parseCalendarFromText(data);
    }
    
    // Handle object with meetings property
    if (data?.meetings && Array.isArray(data.meetings)) {
      return data.meetings.map(transformCalendarEvent);
    }
    
    return [];
  };

  const transformCalendarEvent = (event: any): CalendarEvent => {
    console.log('Transforming event:', event);
    
    // Handle your current format with "Event Summary", "Start Date and Time", etc.
    if (event['Event Summary']) {
      return {
        kind: 'calendar#event',
        summary: event['Event Summary'],
        start: {
          dateTime: event['Start Date and Time']?.dateTime || '',
          timeZone: event['Start Date and Time']?.timeZone || 'UTC'
        },
        end: {
          dateTime: event['End Date and Time']?.dateTime || '',
          timeZone: event['End Date and Time']?.timeZone || 'UTC'
        },
        attendees: Array.isArray(event['Attendees']) 
          ? event['Attendees'].map((attendee: any) => ({
              email: attendee.email,
              responseStatus: attendee.responseStatus || 'needsAction',
              organizer: attendee.organizer || false,
              optional: attendee.optional || false,
              self: attendee.self || false
            }))
          : [],
        hangoutLink: event['Google Meet Link'] || event['meetingLink'],
        htmlLink: event['htmlLink'] || '#',
        status: event.status || 'confirmed'
      };
    }
    
    // Handle other formats
    return {
      kind: 'calendar#event',
      summary: event.title || event.summary || event.name || 'Untitled Meeting',
      start: {
        dateTime: event.startTime ? `${event.date}T${event.startTime}` : event.start?.dateTime || '',
        timeZone: event.timezone || event.start?.timeZone || 'UTC'
      },
      end: {
        dateTime: event.endTime ? `${event.date}T${event.endTime}` : event.end?.dateTime || '',
        timeZone: event.timezone || event.end?.timeZone || 'UTC'
      },
      attendees: Array.isArray(event.attendees) 
        ? event.attendees.map((attendee: any) => {
            if (typeof attendee === 'string') {
              return {
                email: attendee,
                responseStatus: 'needsAction',
                organizer: false,
                optional: false,
                self: false
              };
            }
            return {
              email: attendee.email,
              responseStatus: attendee.responseStatus || 'needsAction',
              organizer: attendee.isOrganizer || attendee.organizer || false,
              optional: attendee.isOptional || attendee.optional || false,
              self: attendee.isSelf || attendee.self || false
            };
          })
        : [],
      hangoutLink: event.meetingLink || event.hangoutLink || event['Google Meet Link'],
      htmlLink: event.htmlLink || '#',
      status: event.status || 'confirmed'
    };
  };

  const parseCalendarFromText = (text: string): CalendarEvent[] => {
    const cleaned = cleanMarkdownResponse(text);
    const events: CalendarEvent[] = [];
    
    // Try to extract meetings from formatted text
    const meetingBlocks = cleaned.split(/\*\*Meeting \d+:\*\*|\*\*Meeting:\*\*/);
    
    meetingBlocks.slice(1).forEach((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let title = '', date = '', startTime = '', endTime = '', attendees: string[] = [];
      
      lines.forEach(line => {
        if (line.includes('Title:')) title = line.split('Title:')[1]?.trim() || '';
        if (line.includes('Date:')) date = line.split('Date:')[1]?.trim() || '';
        if (line.includes('Time:')) {
          const timeMatch = line.match(/(\d{2}:\d{2})(?:\s*-\s*(\d{2}:\d{2}))?/);
          if (timeMatch) {
            startTime = timeMatch[1];
            endTime = timeMatch[2] || startTime;
          }
        }
        if (line.includes('Attendees:')) {
          const attendeeStr = line.split('Attendees:')[1]?.trim() || '';
          attendees = attendeeStr.split(',').map(a => a.trim()).filter(Boolean);
        }
      });
      
      if (title && date) {
        events.push({
          kind: 'calendar#event',
          summary: title,
          start: {
            dateTime: `${date}T${startTime || '00:00'}`,
            timeZone: 'UTC'
          },
          end: {
            dateTime: `${date}T${endTime || '00:00'}`,
            timeZone: 'UTC'
          },
          attendees: attendees.map(email => ({
            email,
            responseStatus: 'needsAction',
            organizer: false,
            optional: false,
            self: false
          })),
          htmlLink: '#',
          status: 'confirmed'
        });
      }
    });
    
    return events;
  };

  const parseAttendeeData = (data: string): AttendeeProfile[] => {
    console.log('Parsing attendee data:', data);
    
    const cleaned = cleanMarkdownResponse(data);
    
    // Try JSON first
    const jsonData = safeJSONParse(cleaned);
    if (Array.isArray(jsonData)) {
      return jsonData.map((person: any) => ({
        email: person.email || '',
        name: person.name || '',
        role: person.role,
        roles: person.roles,
        organization: person.organization,
        organizations: person.organizations,
        background: person.background || '',
        expertise: person.expertise || '',
        context: person.context || '',
        social_media: person.social_media,
        websites: person.websites
      }));
    }
    
    // Fallback to text parsing
    const profiles: AttendeeProfile[] = [];
    const sections = cleaned.split(/\*\*([^*]+@[^*]+)\s*\(([^)]+)\)\*\*/);
    
    for (let i = 1; i < sections.length; i += 3) {
      const email = sections[i]?.trim();
      const name = sections[i + 1]?.trim();
      const content = sections[i + 2] || '';
      
      if (email && name) {
        let role = '', organization = '', background = '', expertise = '', context = '';
        
        const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
        lines.forEach(line => {
          if (line.startsWith('- Role:')) role = line.replace('- Role:', '').trim();
          if (line.startsWith('- Organization:')) organization = line.replace('- Organization:', '').trim();
          if (line.startsWith('- Background:')) background = line.replace('- Background:', '').trim();
          if (line.startsWith('- Expertise:')) expertise = line.replace('- Expertise:', '').trim();
          if (line.startsWith('- Context:')) context = line.replace('- Context:', '').trim();
        });
        
        profiles.push({ email, name, role, organization, background, expertise, context });
      }
    }
    
    return profiles;
  };

  const parseAgendaData = (data: any) => {
    console.log('Parsing agenda data:', data);
    
    // Handle string data
    if (typeof data === 'string') {
      const parsed = safeJSONParse(data);
      if (parsed?.agenda) {
        return parsed.agenda;
      }
      return parsed;
    }
    
    // Handle direct object
    if (data?.agenda) {
      return data.agenda;
    }
    
    return data;
  };

  const parsePrereadData = (data: any) => {
    console.log('Parsing preread data:', data);
    
    // Handle string data
    if (typeof data === 'string') {
      const parsed = safeJSONParse(data);
      if (parsed?.preread_packet) {
        return parsed.preread_packet;
      }
      return parsed;
    }
    
    // Handle direct object
    if (data?.preread_packet) {
      return data.preread_packet;
    }
    
    return data;
  };

  const parseTechnicalData = (data: string) => {
    const cleaned = cleanMarkdownResponse(data);
    
    // Try JSON first
    const jsonData = safeJSONParse(cleaned);
    if (jsonData && typeof jsonData === 'object') {
      return jsonData;
    }
    
    // Parse markdown sections
    const sections = cleaned.split(/^##\s*/gm).filter(Boolean);
    const result: Record<string, any> = {};
    
    sections.forEach((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const title = lines[0].replace(/^#+\s*/, '').trim();
        const content = lines.slice(1).join('\n').trim();
        result[title || `Section ${index + 1}`] = content;
      }
    });
    
    return Object.keys(result).length > 0 ? result : { content: cleaned };
  };

  const parseSlackData = (data: string) => {
    const cleaned = cleanMarkdownResponse(data);
    
    // Try JSON first
    const jsonData = safeJSONParse(cleaned);
    if (jsonData) return jsonData;
    
    // Return cleaned text
    return { content: cleaned };
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    } catch (e) {
      return {
        date: dateTimeString,
        time: ''
      };
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getResponseStatusBadge = (status: string) => {
    const statusConfig = {
      'accepted': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Accepted' },
      'declined': { color: 'bg-red-50 text-red-700 border-red-200', label: 'Declined' },
      'tentative': { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Maybe' },
      'needsAction': { color: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Pending' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.needsAction;
    return <Badge className={`${config.color} border text-xs`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'High': { color: 'bg-red-50 text-red-700 border-red-200', label: 'High Priority' },
      'Medium': { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium Priority' },
      'Low': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Low Priority' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.Medium;
    return <Badge className={`${config.color} border text-xs`}>{config.label}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      case 'figma':
      case 'figma/notion':
        return <Palette className="h-4 w-4" />;
      case 'notion':
        return <FileText className="h-4 w-4" />;
      case 'internal tools':
        return <Database className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  // Tab configuration with better icons and labels
  const getTabConfig = (key: string) => {
    const configs = {
      'calendar': { 
        icon: <Calendar className="h-4 w-4" />, 
        label: 'Calendar',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      'people_research': { 
        icon: <Users className="h-4 w-4" />, 
        label: 'People',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      'technical_context': { 
        icon: <Code className="h-4 w-4" />, 
        label: 'Technical',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      'slack_context': { 
        icon: <MessageSquare className="h-4 w-4" />, 
        label: 'Slack',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
      'agenda': { 
        icon: <FileText className="h-4 w-4" />, 
        label: 'Agenda',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      'preread_documents': { 
        icon: <BookOpen className="h-4 w-4" />, 
        label: 'Pre-read',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    };
    
    return configs[key as keyof typeof configs] || {
      icon: <FileText className="h-4 w-4" />,
      label: key.replace('_', ' '),
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const renderCalendarView = (data: any) => {
    const events = parseCalendarData(data);
    console.log('Parsed events:', events);
    
    if (events.length === 0) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No calendar events found</p>
            <p className="text-gray-400 text-sm mt-1">No upcoming meetings to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {events.map((event, index) => {
          const startTime = formatDateTime(event.start.dateTime);
          const endTime = formatDateTime(event.end.dateTime);
          
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50/50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{event.summary}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                    {event.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{startTime.date}</div>
                      <div className="text-gray-600 text-sm">
                        {startTime.time} - {endTime.time}
                      </div>
                    </div>
                  </div>
                  
                  {event.hangoutLink && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <Video className="h-4 w-4 text-emerald-600" />
                      <a 
                        href={event.hangoutLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 text-sm font-medium flex items-center gap-1"
                      >
                        Join Google Meet <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Attendees ({event.attendees.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {event.attendees.map((attendee, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {attendee.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">{attendee.email}</span>
                              <div className="flex gap-1">
                                {attendee.organizer && <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">Organizer</Badge>}
                                {attendee.optional && <Badge variant="outline" className="bg-gray-50 text-xs">Optional</Badge>}
                                {attendee.self && <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">You</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                        {getResponseStatusBadge(attendee.responseStatus)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderAgendaView = (data: any) => {
    const agendaData = parseAgendaData(data);
    console.log('Parsed agenda:', agendaData);
    
    if (!agendaData || !agendaData.agenda_items) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No agenda items found</p>
            <p className="text-gray-400 text-sm mt-1">No agenda has been prepared</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Meeting Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{agendaData.meeting_title}</h3>
                <p className="text-gray-600 text-sm mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration: {agendaData.estimated_duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Focus: {agendaData.focus_mode}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agenda Items */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-indigo-600" />
            </div>
            Agenda Items ({agendaData.agenda_items.length})
          </h4>
          
          {agendaData.agenda_items.map((item: AgendaItem, index: number) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mt-1">
                      <Timer className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getPriorityBadge(item.priority)}
                    <Badge variant="outline" className="bg-gray-50">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time_allocation}
                    </Badge>
                  </div>
                </div>
                
                {item.context && (
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">Context:</strong> {item.context}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPrereadView = (data: any) => {
    const prereadData = parsePrereadData(data);
    console.log('Parsed preread:', prereadData);
    
    if (!prereadData || !prereadData.documents) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No pre-read documents found</p>
            <p className="text-gray-400 text-sm mt-1">No documents have been prepared for reading</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{prereadData.meeting_title}</h3>
                <p className="text-gray-600 text-sm mt-1">{prereadData.preread_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
            Documents ({prereadData.documents.length})
          </h4>
          
          {prereadData.documents.map((doc: PrereadDocument, index: number) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                      {getSourceIcon(doc.source)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{doc.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{doc.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Star className="h-3 w-3 mr-1" />
                      {doc.relevance_score}/10
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50">
                      {doc.type}
                    </Badge>
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 text-sm">Key Points:</h5>
                  <ul className="space-y-2">
                    {doc.key_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Source: {doc.source}</span>
                    <span>Updated: {doc.last_updated}</span>
                  </div>
                  <a 
                    href={doc.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    View Document <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Items */}
        {prereadData.action_items_context && prereadData.action_items_context.length > 0 && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="font-semibold text-amber-900">Action Items for Meeting Preparation</h4>
              </div>
              <ul className="space-y-3">
                {prereadData.action_items_context.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-amber-800">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPeopleView = (data: string) => {
    const profiles = parseAttendeeData(data);
    console.log('Parsed profiles:', profiles);
    
    if (profiles.length === 0) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No attendee profiles available</p>
            <p className="text-gray-400 text-sm mt-1">No information found about meeting attendees</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {profiles.map((profile, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50/30 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-purple-100">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(profile.role || profile.roles) && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <User className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-blue-900 text-sm">Role{profile.roles ? 's' : ''}</span>
                      <p className="text-sm text-blue-800 mt-1">
                        {profile.roles ? profile.roles.join(', ') : profile.role}
                      </p>
                    </div>
                  </div>
                )}
                
                {(profile.organization || profile.organizations) && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <Building2 className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-purple-900 text-sm">Organization{profile.organizations ? 's' : ''}</span>
                      <p className="text-sm text-purple-800 mt-1">
                        {profile.organizations ? profile.organizations.join(', ') : profile.organization}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.websites && profile.websites.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <Link className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-emerald-900 text-sm">Websites</span>
                      <div className="text-sm text-emerald-800 mt-1 space-y-1">
                        {profile.websites.map((website, i) => (
                          <a 
                            key={i}
                            href={website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block hover:underline"
                          >
                            {website}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {profile.background && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <GraduationCap className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-green-900 text-sm">Background</span>
                      <p className="text-sm text-green-800 mt-1 leading-relaxed">{profile.background}</p>
                    </div>
                  </div>
                )}
                
                {profile.expertise && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <Star className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-orange-900 text-sm">Expertise</span>
                      <p className="text-sm text-orange-800 mt-1 leading-relaxed">{profile.expertise}</p>
                    </div>
                  </div>
                )}
                
                {profile.context && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Context</span>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{profile.context}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTechnicalView = (data: string) => {
    const parsedData = parseTechnicalData(data);
    
    if (typeof parsedData === 'object' && parsedData.content) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">{parsedData.content}</pre>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (typeof parsedData === 'object') {
      return (
        <div className="space-y-6">
          {Object.entries(parsedData).map(([title, content], index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-green-50/30 to-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-900">{title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">
                    {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Code className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No technical context available</p>
          <p className="text-gray-400 text-sm mt-1">No technical information has been gathered</p>
        </CardContent>
      </Card>
    );
  };

  const renderSlackView = (data: string) => {
    const parsedData = parseSlackData(data);
    
    if (!parsedData?.content || parsedData.content.includes('No information available')) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No Slack communications available</p>
            <p className="text-gray-400 text-sm mt-1">No relevant Slack messages found</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-r from-pink-50/30 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-pink-600" />
            </div>
            <span className="text-gray-900">Slack Communications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">
              {parsedData.content}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = (key: string, value: any) => {
    const currentViewMode = viewModes[key] || 'visual';
    
    if (currentViewMode === 'raw') {
      const rawContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      return (
        <div className="bg-gray-50 border-0 rounded-xl shadow-sm">
          <pre className="p-6 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {rawContent}
          </pre>
        </div>
      );
    }

    // Visual rendering based on content type
    switch (key) {
      case 'calendar':
        return renderCalendarView(value);
      case 'people_research':
        return renderPeopleView(value);
      case 'technical_context':
        return renderTechnicalView(value);
      case 'slack_context':
        return renderSlackView(value);
      case 'agenda':
        return renderAgendaView(value);
      case 'preread_documents':
        return renderPrereadView(value);
      default:
        return (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-96 overflow-y-auto font-mono">
                  {cleanMarkdownResponse(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}
                </pre>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const resultEntries = Object.entries(results).filter(([key, value]) => 
    value && key !== 'final_briefing' && key !== 'coordinator'
  );

  const finalBriefing = results.final_briefing || results.coordinator;

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Meeting Preparation Complete</h2>
              <p className="text-gray-600">All research and analysis has been completed successfully</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {finalBriefing && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-emerald-900">Executive Summary</CardTitle>
                  <p className="text-emerald-700 text-sm mt-1">Complete meeting briefing and recommendations</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                  onClick={() => copyToClipboard(cleanMarkdownResponse(finalBriefing), 'final_briefing')}
                >
                  {copiedKey === 'final_briefing' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                  onClick={() => downloadAsFile(cleanMarkdownResponse(finalBriefing), 'meeting-briefing.txt')}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                  {cleanMarkdownResponse(finalBriefing)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Tabs */}
      {resultEntries.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue={resultEntries[0][0]} className="w-full">
              {/* Horizontal Scrollable Tab List */}
              <div className="border-b border-gray-100 p-6 pb-0">
                <TabsList className="grid grid-flow-col auto-cols-fr w-full bg-gray-50 p-1 rounded-xl border-0 shadow-sm">
                  {resultEntries.map(([key]) => {
                    const config = getTabConfig(key);
                    return (
                      <TabsTrigger 
                        key={key} 
                        value={key} 
                        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-0 transition-all duration-200"
                      >
                        <div className={`${config.color}`}>
                          {config.icon}
                        </div>
                        <span className="hidden sm:inline">{config.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {resultEntries.map(([key, value]) => {
                  const config = getTabConfig(key);
                  return (
                    <TabsContent key={key} value={key} className="space-y-6 mt-0">
                      {/* Section Header */}
                      <div className={`flex items-center justify-between p-4 ${config.bgColor} rounded-xl border-0`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                            <div className={config.color}>
                              {config.icon}
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {config.label} Results
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleViewMode(key)}
                            className="text-xs border-0 bg-white/50 hover:bg-white"
                          >
                            {viewModes[key] === 'visual' ? (
                              <>
                                <Code2 className="h-3 w-3 mr-1" />
                                Raw Data
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Visual View
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-0 bg-white/50 hover:bg-white"
                            onClick={() => copyToClipboard(
                              cleanMarkdownResponse(typeof value === 'string' ? value : JSON.stringify(value, null, 2)), 
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
                            className="border-0 bg-white/50 hover:bg-white"
                            onClick={() => downloadAsFile(
                              cleanMarkdownResponse(typeof value === 'string' ? value : JSON.stringify(value, null, 2)),
                              `${key}-results.txt`
                            )}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {renderContent(key, value)}
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}