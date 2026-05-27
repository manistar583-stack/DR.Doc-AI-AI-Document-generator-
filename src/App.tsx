import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2, Paperclip, MoreVertical, Layers, ArrowUpCircle, X, File as FileIcon, Download, Copy, Check, FileType, Plus, Menu, Trash2, RotateCcw, LogOut, Sun, Moon, LayoutTemplate, List, Mic, MicOff, ChevronDown, ChevronRight } from 'lucide-react';
import { Message, AttachmentData, ChatSession } from './types';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { cn } from './components/MarkdownRenderer';
import { Login } from './components/Login';
import html2pdf from 'html2pdf.js';
import pptxgen from 'pptxgenjs';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const MessageActions = ({ messageId, text }: { messageId: string, text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsMd = () => {
    downloadFile(`DrDoc-${Date.now()}.md`, text, 'text/markdown');
    setIsOpen(false);
  };

  const exportAsTxt = () => {
    downloadFile(`DrDoc-${Date.now()}.txt`, text, 'text/plain');
    setIsOpen(false);
  };

  const exportAsDoc = () => {
    const el = document.getElementById(`msg-content-${messageId}`);
    if (el) {
      const htmlContent = el.innerHTML;
      const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title><style>body { font-family: Arial, sans-serif; }</style></head><body>`;
      const postHtml = "</body></html>";
      const html = preHtml + htmlContent + postHtml;
      const blob = new Blob(['\\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DrDoc-${Date.now()}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setIsOpen(false);
  };

  const exportAsHtml = () => {
    const el = document.getElementById(`msg-content-${messageId}`);
    if (el) {
      const htmlContent = el.innerHTML;
      const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Document</title><style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #333; }</style></head><body>${htmlContent}</body></html>`;
      downloadFile(`DrDoc-${Date.now()}.html`, html, 'text/html');
    }
    setIsOpen(false);
  };

  const exportAsPdf = () => {
    const el = document.getElementById(`msg-content-${messageId}`);
    if (el) {
      const opt = {
        margin:       0.5,
        filename:     `DrDoc-${Date.now()}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
      };
      html2pdf().from(el).set(opt).save();
    }
    setIsOpen(false);
  };

  const exportAsPptx = () => {
    const pres = new pptxgen();
    let slides = text.split('\n## ');
    if (slides.length <= 1) {
       slides = text.split('\n# ');
    }
    
    slides.forEach((slideText, idx) => {
       const slide = pres.addSlide();
       const lines = slideText.trim().split('\n');
       const titleIdx = lines.findIndex(l => l.match(/^#*\s*/));
       let title = '';
       let contentLines = [];
       if (titleIdx >= 0 && lines[titleIdx]) {
           title = lines[titleIdx].replace(/^#+\s*/g, '').trim();
           contentLines = lines.slice(titleIdx + 1);
       } else {
           title = lines[0] ? lines[0].replace(/^#+\s*/g, '').trim() : '';
           contentLines = lines.slice(1);
       }
       
       slide.addText(title, { x: 0.5, y: 0.5, w: "90%", h: 1, fontSize: 32, bold: true, color: "363636" });
       const contentParts = contentLines.join('\n').trim();
       if (contentParts) {
         const filteredLines = contentParts.split('\n').filter(l => l.trim() !== '');
         const contentString = filteredLines.map(l => l.replace(/^[-\*]\s/, '\u2022 ')).join('\n');
         slide.addText(contentString, { x: 0.5, y: 1.5, w: "90%", h: "75%", fontSize: 18, color: "666666", align: "left", valign: "top", autoFit: true, breakLine: true });
       }
    });
    
    pres.writeFile({ fileName: `DrDoc-${Date.now()}.pptx` });
    setIsOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center mb-[-12px] mr-[-12px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <div className="bg-white dark:bg-gray-800 border text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center p-1 space-x-1 transition-colors">
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-500 dark:text-gray-400 rounded-md transition-colors"
          title="Copy text"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-500 dark:text-gray-400 rounded-md transition-colors flex items-center space-x-1"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium pr-1">Export</span>
          </button>
          
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 overflow-hidden text-sm transition-colors">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                  Save Document As...
                </div>
                <button onClick={exportAsPdf} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-700">PDF (.pdf)</button>
                <button onClick={exportAsPptx} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-700">PowerPoint (.pptx)</button>
                <button onClick={exportAsDoc} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Word (.doc)</button>
                <button onClick={exportAsMd} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Markdown (.md)</button>
                <button onClick={exportAsHtml} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">HTML (.html)</button>
                <button onClick={exportAsTxt} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Plain Text (.txt)</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const initialSessionId = Date.now().toString();
const initialMessages: Message[] = [
  {
    id: 'system-start',
    role: 'model',
    text: "Hello! I'm Dr. Doc — your personal AI Documentation Engineer.\n\nHow can I help you with documents today? (Create, Edit, Convert, or Transform)",
    createdAt: Date.now(),
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Dr. Doc (Gemini Flash)');

  const quickTemplates = [
    {
      title: "Project Brief",
      content: "Write a comprehensive Project Brief including: \n\n1. Project Overview\n2. Objectives & Goals\n3. Target Audience\n4. Scope of Work\n5. Timeline & Milestones\n6. Budget"
    },
    {
      title: "Meeting Minutes",
      content: "Draft Meeting Minutes based on the following notes: \n\n**Date:** [Date]\n**Attendees:** [List Attendees]\n\n**Agenda Topics Discussed:**\n- [Topic 1]\n\n**Action Items:**\n- [ ] [Task] - [Owner]"
    },
    {
      title: "Standard Operating Procedure",
      content: "Create a Standard Operating Procedure (SOP) for [Insert Task]. Include:\n\n1. Purpose\n2. Scope\n3. Responsibilities\n4. Step-by-Step Procedure\n5. References/Tools needed"
    },
    {
      title: "Slide Deck Outline",
      content: "Generate a 10-slide presentation outline about [Insert Topic]. Format each slide with:\n\n## Slide [Number]: [Title]\n- Bullet point 1\n- Bullet point 2"
    },
    {
      title: "Executive Summary",
      content: "Write an Executive Summary highlighting the key points, financial metrics, and major takeaways from the provided text/data."
    }
  ];

  const handleApplyTemplate = (content: string) => {
    setInput(content);
    setShowTemplatesModal(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 50);
  };

  const handleDownloadSession = async (format: 'md' | 'txt' | 'doc' | 'pdf' | 'pptx') => {
    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
    if (!activeSession) return;
    const modelMessages = activeSession.messages.filter(m => m.role === 'model').filter(m => m.id !== 'system-start');
    if (modelMessages.length === 0) return;
    
    const latestMsg = modelMessages[modelMessages.length - 1];
    const latestText = latestMsg.text;
    
    const downloadFile = (filename: string, content: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if (format === 'md') {
      downloadFile(`DrDoc-${activeSession.title}.md`, latestText, 'text/markdown');
    } else if (format === 'txt') {
      downloadFile(`DrDoc-${activeSession.title}.txt`, latestText, 'text/plain');
    } else if (format === 'doc') {
      const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title><style>body { font-family: Arial, sans-serif; }</style></head><body>`;
      const postHtml = "</body></html>";
      
      const elId = `msg-content-${latestMsg.id}`;
      const el = document.getElementById(elId);
      
      const htmlContent = el ? el.innerHTML : `<pre>${latestText}</pre>`;
      const html = preHtml + htmlContent + postHtml;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DrDoc-${activeSession.title}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const elId = `msg-content-${latestMsg.id}`;
      const el = document.getElementById(elId);
      if (el) {
        const opt = {
          margin:       0.5,
          filename:     `DrDoc-${activeSession.title}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
        };
        html2pdf().from(el).set(opt).save();
      }
    } else if (format === 'pptx') {
      const pres = new pptxgen();
      let slides = latestText.split('\n## ');
      if (slides.length <= 1) {
         slides = latestText.split('\n# ');
      }
      
      slides.forEach((slideText, idx) => {
         const slide = pres.addSlide();
         const lines = slideText.trim().split('\n');
         const titleIdx = lines.findIndex(l => l.match(/^#*\s*/));
         let title = '';
         let contentLines = [];
         if (titleIdx >= 0 && lines[titleIdx]) {
             title = lines[titleIdx].replace(/^#+\s*/g, '').trim();
             contentLines = lines.slice(titleIdx + 1);
         } else {
             title = lines[0] ? lines[0].replace(/^#+\s*/g, '').trim() : '';
             contentLines = lines.slice(1);
         }
         
         slide.addText(title, { x: 0.5, y: 0.5, w: "90%", h: 1, fontSize: 32, bold: true, color: "363636" });
         const contentParts = contentLines.join('\n').trim();
         if (contentParts) {
           const filteredLines = contentParts.split('\n').filter(l => l.trim() !== '');
           const contentString = filteredLines.map(l => l.replace(/^[-\*]\s/, '\u2022 ')).join('\n');
           slide.addText(contentString, { x: 0.5, y: 1.5, w: "90%", h: "75%", fontSize: 18, color: "666666", align: "left", valign: "top", autoFit: true, breakLine: true });
         }
      });
      
      pres.writeFile({ fileName: `DrDoc-${activeSession.title}.pptx` });
    }
    
    setShowDownloadMenu(false);
  };


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: initialSessionId,
      title: 'New Document',
      messages: initialMessages,
      updatedAt: Date.now(),
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarMode, setSidebarMode] = useState<'projects' | 'recycle-bin'>('projects');

  const activeSessions = sessions.filter(s => !s.isDeleted).sort((a,b) => b.updatedAt - a.updatedAt);
  const deletedSessions = sessions.filter(s => s.isDeleted).sort((a,b) => b.updatedAt - a.updatedAt);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];
  const isDeletedSession = activeSession?.isDeleted;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState('Auto');
  const [customOutputFormat, setCustomOutputFormat] = useState('');
  
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(window.innerWidth >= 1024);
  const [collapsedHeadings, setCollapsedHeadings] = useState<Record<string, boolean>>({});

  const toggleHeadingCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedHeadings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsTocOpen(true);
      else setIsTocOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const headingElements = Array.from(document.querySelectorAll('.app-content-area h1, .app-content-area h2, .app-content-area h3'));
      const newHeadings = headingElements.map(el => {
        return {
          id: el.id,
          text: el.textContent || '',
          level: parseInt(el.tagName[1])
        };
      }).filter(h => h.id && h.text);
      setHeadings(newHeadings);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [messages, isStreaming]);
  
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (window.innerWidth < 1024) {
      setIsTocOpen(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          
          if (currentTranscript) {
            setInput((prev) => {
              const prevTrimmed = prev.trim();
              const prefix = prevTrimmed ? prevTrimmed + ' ' : '';
              return prefix + currentTranscript.trim();
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
       recognitionRef.current?.stop();
    } else {
       try {
         recognitionRef.current?.start();
         setIsListening(true);
       } catch (e) {
         console.error(e);
       }
    }
  };


  const createNewSession = () => {
    // Check limit
    if (!isAuthenticated && activeSessions.length >= 3) {
      setLoginMessage("You've reached your limit of 3 free documents. Please sign in to create more.");
      setShowLogin(true);
      return;
    }

    const newSessionId = Date.now().toString();
    setSessions(prev => [
      {
        id: newSessionId,
        title: 'New Document',
        messages: initialMessages,
        updatedAt: Date.now(),
      },
      ...prev
    ]);
    setActiveSessionId(newSessionId);
    if (sidebarMode === 'recycle-bin') {
      setSidebarMode('projects');
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s));
    if (activeSessionId === id || sidebarMode === 'projects') {
      const remaining = sessions.filter(s => s.id !== id && !s.isDeleted);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const restoreSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isDeleted: false } : s));
    setActiveSessionId(id);
    setSidebarMode('projects');
  };

  const permanentlyDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remainingDeleted = sessions.filter(s => s.id !== id && s.isDeleted);
      if (remainingDeleted.length > 0) {
         setActiveSessionId(remainingDeleted[0].id);
      } else {
         const remainingActive = sessions.filter(s => s.id !== id && !s.isDeleted);
         if (remainingActive.length > 0) {
           setActiveSessionId(remainingActive[0].id);
         } else {
           createNewSession();
         }
         setSidebarMode('projects');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
    // Safely reset input value so the exact same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || isLoading || isStreaming) return;

    const currentSessionId = activeSessionId;
    
    const updateSessionMessages = (updater: React.SetStateAction<Message[]>) => {
      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === currentSessionId) {
          const prevMessages = session.messages;
          const newMessages = typeof updater === 'function' ? (updater as any)(prevMessages) : updater;
          let newTitle = session.title;
          if (session.title === 'New Document' && newMessages.length > 1) {
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg && firstUserMsg.text) {
              newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            } else if (firstUserMsg && firstUserMsg.attachments && firstUserMsg.attachments.length > 0) {
              newTitle = firstUserMsg.attachments[0].fileName;
            }
          }
          return { ...session, messages: newMessages, updatedAt: Date.now(), title: newTitle };
        }
        return session;
      }));
    };

    // Snapshot state and reset UI immediately to prevent double-clicks
    const userText = input.trim();
    const filesToProcess = [...selectedFiles];
    
    setInput('');
    setSelectedFiles([]);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let uploadedAttachments: AttachmentData[] = [];
      if (filesToProcess.length > 0) {
        for (const file of filesToProcess) {
          const base64 = await fileToBase64(file);
          
          let mimeType = file.type;
          const validDocTypes = ['application/pdf', 'text/plain', 'text/html', 'text/csv', 'text/md', 'text/rtf', 'text/xml'];
          
          // Map unknown or unsupported file types to text/plain to avoid Gemini API errors
          if (!mimeType || (!mimeType.startsWith('image/') && !mimeType.startsWith('video/') && !mimeType.startsWith('audio/') && !validDocTypes.includes(mimeType))) {
            mimeType = 'text/plain';
          }

          uploadedAttachments.push({
            fileName: file.name,
            mimeType: mimeType,
            data: base64
          });
        }
      }

      const newUserMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: userText,
        createdAt: Date.now(),
        attachments: uploadedAttachments,
      };

      updateSessionMessages((prev) => [...prev, newUserMsg]);

      // Send history inclusive of the newly added message, avoiding the initial hardcoded message
      const chatHistory = [...messages, newUserMsg].slice(1);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory,
          outputFormat: outputFormat === 'Custom' ? customOutputFormat : outputFormat,
          selectedModel: selectedModel,
        }),
      });

      if (!response.ok) {
        let errorText = 'Network response was not ok';
        try {
          const errData = await response.json();
          if (errData.error) errorText = errData.error;
        } catch (e) {
          // Ignore json parse error
        }
        throw new Error(errorText);
      }

      setIsLoading(false);
      setIsStreaming(true);

      const modelMessageId = (Date.now() + 1).toString();
      updateSessionMessages((prev) => [
        ...prev,
        {
          id: modelMessageId,
          role: 'model',
          text: '',
          createdAt: Date.now(),
        }
      ]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullText = '';
        let displayedText = '';
        let isDone = false;

        const updateDisplay = () => {
          if (displayedText.length < fullText.length) {
            const remaining = fullText.length - displayedText.length;
            const charsToAdd = Math.max(3, Math.ceil(remaining / 10));
            displayedText += fullText.slice(displayedText.length, displayedText.length + charsToAdd);
            
            updateSessionMessages((prev) => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.findIndex((m) => m.id === modelMessageId);
              if (lastMessageIndex !== -1) {
                newMessages[lastMessageIndex] = {
                  ...newMessages[lastMessageIndex],
                  text: displayedText,
                };
              }
              return newMessages;
            });
          }
          
          if (!isDone || displayedText.length < fullText.length) {
            setTimeout(updateDisplay, 30);
          } else {
            setIsStreaming(false);
          }
        };

        setTimeout(updateDisplay, 30);

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            fullText += decoder.decode();
            isDone = true;
            break;
          }
          fullText += decoder.decode(value, { stream: true });
        }
      } else {
        setIsStreaming(false);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error?.message || 'Sorry, I encountered an error while processing your request. Please check your API keys or try again.';
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `**Error:** ${errorMessage}`,
        createdAt: Date.now(),
      };
      updateSessionMessages((prev) => [...prev, errorMsg]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLogin) {
    return (
      <Login 
        onLogin={() => {
          setIsAuthenticated(true);
          setShowLogin(false);
        }} 
        onClose={() => setShowLogin(false)}
        message={loginMessage}
        theme={theme}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 dark:bg-black text-gray-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-64 sm:w-72 shrink-0 border-r border-gray-800",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-0 overflow-hidden" 
        )}
      >
        <div className="p-4 shrink-0">
          <button 
            onClick={createNewSession}
            className="flex items-center space-x-2 w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white font-medium border border-gray-700 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Document</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 w-full min-w-[16rem]">
          {sidebarMode === 'projects' ? (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2 mt-2">Projects</div>
              {activeSessions.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => { setActiveSessionId(session.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                  className={cn(
                    "flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer group", 
                    session.id === activeSessionId ? "bg-gray-800 text-white shadow-sm font-medium" : "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                  )}
                >
                  <div className="flex flex-1 items-center space-x-2 overflow-hidden mr-2">
                    <FileText className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="truncate flex-1">{session.title}</span>
                  </div>
                  <button 
                     title="Delete Document" 
                     onClick={(e) => deleteSession(e, session.id)} 
                     className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No active projects.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 mt-2">Recycle Bin</div>
              {deletedSessions.map(session => (
                <div 
                   key={session.id}
                   onClick={() => { setActiveSessionId(session.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                   className={cn(
                      "flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer group", 
                      session.id === activeSessionId ? "bg-gray-800 text-white shadow-sm font-medium" : "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                    )}
                >
                  <div className="flex flex-1 items-center space-x-2 overflow-hidden mr-2">
                    <Trash2 className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="truncate flex-1">{session.title}</span>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Restore" onClick={(e) => restoreSession(e, session.id)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-green-400">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button title="Permanently Delete" onClick={(e) => permanentlyDeleteSession(e, session.id)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {deletedSessions.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  Recycle bin is empty.
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-800 shrink-0">
          {sidebarMode === 'projects' ? (
            <button onClick={() => setSidebarMode('recycle-bin')} className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Recycle Bin</span>
              </div>
              {deletedSessions.length > 0 && <span className="bg-gray-800 text-xs px-2 py-0.5 rounded-full">{deletedSessions.length}</span>}
            </button>
          ) : (
            <button onClick={() => setSidebarMode('projects')} className="flex items-center space-x-2 w-full px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Layers className="w-4 h-4" />
              <span>Back to Projects</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full min-w-0 transition-all duration-300 relative bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
              title="Toggle Sidebar"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 -ml-1 mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden md:block"
              title="Toggle Sidebar"
            >
              <div className="flex flex-col space-y-1 w-5 justify-center mt-0.5">
                 <div className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                 <div className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                 <div className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
              </div>
            </button>
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg shadow-md hidden sm:flex">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">Dr. Doc</h1>
              <p className="hidden sm:block text-xs font-medium text-indigo-600 dark:text-indigo-400 tracking-wide">AI Documentation Engineer</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mr-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-0 text-gray-700 dark:text-gray-300 rounded-lg py-1.5 px-2 cursor-pointer transition-colors"
            >
              <option value="Dr. Doc (Gemini Flash)">Gemini Flash (Default)</option>
              <option value="Dr. Doc Pro (Gemini Pro)">Gemini Pro</option>
              <option value="OpenDocs (GPT-4o style)">OpenDocs (GPT-4o style)</option>
              <option value="ClaudeScribe (Claude 3.5 style)">ClaudeScribe (Claude 3.5 style)</option>
            </select>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" 
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsTocOpen(!isTocOpen)} 
              className={cn("p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors", isTocOpen && "bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400")} 
              title="Table of Contents"
            >
              <List className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                title="Download Document" 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:flex items-center"
              >
                <Download className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Download</span>
              </button>
              {showDownloadMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 overflow-hidden text-sm transition-colors">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                      Save Session As...
                    </div>
                    <button onClick={() => handleDownloadSession('pdf')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-700">PDF (.pdf)</button>
                    <button onClick={() => handleDownloadSession('pptx')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-700">PowerPoint (.pptx)</button>
                    <button onClick={() => handleDownloadSession('doc')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Word (.doc)</button>
                    <button onClick={() => handleDownloadSession('md')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Markdown (.md)</button>
                    <button onClick={() => handleDownloadSession('txt')} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">Plain Text (.txt)</button>
                  </div>
                </>
              )}
            </div>
            {!isAuthenticated ? (
              <button 
                onClick={() => {
                  setLoginMessage('');
                  setShowLogin(true);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Sign in
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hover:text-red-600 dark:hover:text-red-400" 
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 w-full space-y-8 app-content-area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "flex items-start max-w-[85%] md:max-w-[75%]",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div 
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-1",
                    message.role === 'user' 
                      ? "bg-gray-800 ml-3" 
                      : "bg-indigo-600 mr-3"
                  )}
                >
                  {message.role === 'user' ? (
                    <span className="text-xs font-bold text-white">U</span>
                  ) : (
                    <FileText className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "relative px-5 py-4 rounded-2xl shadow-sm border transition-colors",
                    message.role === 'user'
                      ? "bg-gray-900 dark:bg-gray-800 text-white border-gray-800 dark:border-gray-700 rounded-tr-none"
                      : "bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 rounded-tl-none overflow-x-hidden group",
                    (isStreaming && message.id === messages[messages.length - 1].id && message.role === 'model') ? "streaming-message" : ""
                  )}
                >
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed flex flex-col space-y-2">
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                          {message.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5 bg-gray-800 dark:bg-gray-700 text-gray-300 px-2 py-1.5 rounded-md text-sm border border-gray-700 dark:border-gray-600">
                               <FileIcon className="w-3.5 h-3.5" />
                               <span className="truncate max-w-[150px]">{att.fileName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div>{message.text}</div>
                    </div>
                  ) : (
                    <div id={`msg-content-${message.id}`}>
                      <MarkdownRenderer content={message.text || '...'} />
                    </div>
                  )}
                  
                  {message.role === 'model' && !isStreaming && (
                    <div className="absolute top-2 right-2">
                      <MessageActions messageId={message.id} text={message.text} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex items-start max-w-[85%] md:max-w-[75%] flex-row">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-1 bg-indigo-600 mr-3">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 transition-colors">
                  <Loader2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-spin" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Drafting document...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shrink-0 transition-colors">
        {isDeletedSession ? (
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800 border rounded-xl space-y-3 sm:space-y-0 text-center sm:text-left transition-colors">
             <span className="text-sm font-bold flex items-center justify-center sm:justify-start"><Trash2 className="w-5 h-5 mr-1.5"/> This document is in the Recycle Bin.</span>
             <button onClick={(e) => restoreSession(e, activeSession.id)} className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium shadow-sm transition-colors cursor-pointer shrink-0">
               <RotateCcw className="w-4 h-4" />
               <span>Restore Document</span>
             </button>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto flex flex-col shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden">
          
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-sm transition-colors">
             <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
               <FileType className="w-4 h-4 text-gray-400 dark:text-gray-500" />
               <span className="font-medium">Output Format:</span>
               <select 
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer p-0 hover:text-indigo-700 dark:hover:text-indigo-300"
               >
                 <option value="Auto">Auto (Default)</option>
                 <option value="Professional Report">Professional Report</option>
                 <option value="PowerPoint Presentation">PowerPoint Presentation</option>
                 <option value="SOP">Standard Operating Procedure</option>
                 <option value="Executive Summary">Executive Summary</option>
                 <option value="Markdown Table">Data Table</option>
                 <option value="Email/Letter">Email / Letter</option>
                 <option value="Resume/CV">Resume / CV</option>
                 <option value="Custom">Custom...</option>
               </select>
               {outputFormat === 'Custom' && (
                 <input 
                   type="text"
                   value={customOutputFormat}
                   onChange={(e) => setCustomOutputFormat(e.target.value)}
                   placeholder="e.g., Legal Contract, Poem..."
                   className="ml-2 bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 text-sm w-48 text-gray-800 dark:text-gray-200"
                   autoFocus
                 />
               )}
             </div>
          </div>

          {/* Selected Files Area */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-lg text-sm shadow-sm">
                  <FileIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="p-3 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Quick Templates"
            >
              <LayoutTemplate className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={handleFileClick}
              className="p-3 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-bl-xl border-l border-transparent"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Describe the document you need or paste your text here..."
              className="w-full max-h-48 min-h-[56px] py-4 px-2 resize-none bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-[15px] leading-relaxed"
              rows={1}
            />

            <button
              onClick={toggleListening}
              className={cn("p-3 shrink-0 transition-colors rounded-lg", 
                isListening ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20" : "text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
              title={isListening ? "Stop listening" : "Start dictating"}
            >
              {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && selectedFiles.length === 0) || isLoading || isStreaming}
              className="p-3 m-1 shrink-0 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors disabled:cursor-not-allowed"
            >
              {isLoading || isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpCircle className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center">
          <p className="text-xs text-gray-400">
            Dr. Doc can process markdown, tables, format text, and generate strict structural templates.
          </p>
        </div>
        </>
        )}
      </footer>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowTemplatesModal(false)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[80vh] border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <LayoutTemplate className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Quick Templates
              </h2>
              <button onClick={() => setShowTemplatesModal(false)} className="p-2 -mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto w-full">
              <div className="grid gap-3">
                {quickTemplates.map((template, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleApplyTemplate(template.content)}
                    className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 group"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{template.content}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* TOC Right Sidebar */}
      <div
        className={cn(
          "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col",
          isTocOpen ? "w-64 max-w-[30%]" : "w-0 border-l-0"
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between min-w-[16rem]">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
             <List className="w-4 h-4 mr-2" />
             Table of Contents
          </h2>
          <button 
             onClick={() => setIsTocOpen(false)}
             className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400"
          >
             <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 min-w-[16rem]">
          {headings.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">No headings found</div>
          ) : (
            (() => {
              let currentH1Id: string | null = null;
              return headings.map((heading, i) => {
                let hasChildren = false;
                if (heading.level === 1) {
                  currentH1Id = heading.id;
                  for (let j = i + 1; j < headings.length; j++) {
                    if (headings[j].level === 1) break;
                    if (headings[j].level > 1) {
                      hasChildren = true;
                      break;
                    }
                  }
                }

                const isCollapsed = currentH1Id && collapsedHeadings[currentH1Id];
                if (heading.level > 1 && isCollapsed) {
                  return null;
                }

                return (
                  <div key={`${heading.id}-${i}`} className={cn("flex items-center w-full group", heading.level === 1 && "mt-2 first:mt-0")}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={cn(
                        "flex-1 text-left block truncate px-2 py-1.5 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
                        heading.level === 1 && "font-semibold text-gray-900 dark:text-gray-200",
                        heading.level === 2 && "pl-6",
                        heading.level === 3 && "pl-10 text-xs"
                      )}
                      title={heading.text}
                    >
                      {heading.text}
                    </button>
                    {heading.level === 1 && hasChildren && (
                      <button
                        onClick={(e) => toggleHeadingCollapse(heading.id, e)}
                        className="p-1 shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={isCollapsed ? "Expand" : "Collapse"}
                      >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>

    </div>
  );
}

