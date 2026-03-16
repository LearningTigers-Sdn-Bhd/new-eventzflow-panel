"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Play, Pause, AlertCircle, Upload, FileAudio, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateVoiceScript, type ScriptLanguage } from "./voice-script-generator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AudioRecorderProps {
  onSamplesChange: (blobs: Blob[]) => void;
  maxDurationSeconds?: number;
}

export function AudioRecorder({
  onSamplesChange,
  maxDurationSeconds = 60,
}: AudioRecorderProps) {
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobs, setAudioBlobs] = useState<{ blob: Blob; url: string; name: string }[]>([]);
  const [isPlaying, setIsSpeaking] = useState<number | null>(null); // Index of playing sample
  const [error, setError] = useState<string | null>(null);
  const [scriptLang, setScriptLang] = useState<ScriptLanguage>("english");
  const [currentScript, setCurrentScript] = useState(generateVoiceScript("english"));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up urls
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      audioBlobs.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (audioBlobs.length + files.length > 5) {
      setError("Maximum 5 files allowed.");
      return;
    }

    const newBlobs = [...audioBlobs];
    let hasError = false;

    files.forEach(file => {
      // Validate type
      const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav", "audio/mp4", "audio/m4a"];
      if (!validTypes.includes(file.type) && !file.name.endsWith(".mp3") && !file.name.endsWith(".m4a")) {
        setError(`Invalid file type for ${file.name}. Please upload MP3, WAV, or M4A.`);
        hasError = true;
        return;
      }

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 10MB.`);
        hasError = true;
        return;
      }

      newBlobs.push({
        blob: file,
        url: URL.createObjectURL(file),
        name: file.name
      });
    });

    if (!hasError) {
      setAudioBlobs(newBlobs);
      onSamplesChange(newBlobs.map(b => b.blob));
      setError(null);
    }
  };

  const startRecordingFlow = () => {
    if (audioBlobs.length >= 5) {
      setError("Maximum 5 samples allowed.");
      return;
    }
    
    setError(null);
    setCountdown(3);
    setRecordingTime(0); // Reset time before starting
    
    // Clear any existing interval before starting a new one
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const name = `Recording ${audioBlobs.length + 1}`;
        const url = URL.createObjectURL(blob);
        
        const newBlobs = [...audioBlobs, { blob, url, name }];
        setAudioBlobs(newBlobs);
        onSamplesChange(newBlobs.map(b => b.blob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      // Clear any previous timer just in case
      if (timerRef.current) clearInterval(timerRef.current);

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDurationSeconds) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError("Could not access microphone. Please check your permissions.");
      console.error("Mic error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Always clear the timer interval and reset the ref
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const deleteSample = (index: number) => {
    const item = audioBlobs[index];
    URL.revokeObjectURL(item.url);
    
    const newBlobs = audioBlobs.filter((_, i) => i !== index);
    setAudioBlobs(newBlobs);
    onSamplesChange(newBlobs.map(b => b.blob));
    
    if (isPlaying === index) {
      if (audioRef.current) audioRef.current.pause();
      setIsSpeaking(null);
    }
  };

  const togglePlayback = (index: number) => {
    if (!audioRef.current) return;

    if (isPlaying === index) {
      audioRef.current.pause();
      setIsSpeaking(null);
    } else {
      setIsSpeaking(index);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = audioBlobs[index].url;
          audioRef.current.play();
        }
      }, 0);
    }
  };

  const refreshScript = (lang?: ScriptLanguage) => {
    const targetLang = lang || scriptLang;
    setCurrentScript(generateVoiceScript(targetLang));
  };

  const handleLangChange = (lang: ScriptLanguage) => {
    setScriptLang(lang);
    refreshScript(lang);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (recordingTime / maxDurationSeconds) * 100;

  return (
    <div className="space-y-4 w-full">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col border-2 border-dashed rounded-xl bg-muted/30 overflow-hidden">
        {/* Progress header for multi-sample */}
        <div className="bg-slate-50 border-b px-4 py-2 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Captured Samples ({audioBlobs.length}/5)</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors",
                  i < audioBlobs.length ? "bg-primary" : "bg-slate-200"
                )} 
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col relative">
          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
              <span className="text-7xl font-bold text-primary animate-bounce">{countdown}</span>
              <p className="text-sm font-medium text-slate-500 mt-4 uppercase tracking-widest">Get ready to read...</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "record" | "upload")} className="w-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-muted/10 h-12 p-0">
              <TabsTrigger 
                value="record" 
                className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary transition-all gap-2"
              >
                <Mic className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Record Live</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="rounded-none h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary transition-all gap-2"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Upload Files</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="flex flex-col md:flex-row gap-6 p-6 mt-0 min-h-[250px]">
              <div className="flex-1 flex flex-col space-y-3 min-w-0">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Reading Script</span>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={scriptLang} 
                      onValueChange={(v) => handleLangChange(v as ScriptLanguage)}
                      disabled={isRecording || countdown !== null}
                    >
                      <SelectTrigger className="h-6 text-[10px] w-28 rounded-none bg-white px-2">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english" className="text-[10px]">English</SelectItem>
                        <SelectItem value="malay" className="text-[10px]">Bahasa Melayu</SelectItem>
                        <SelectItem value="chinese" className="text-[10px]">Chinese</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => refreshScript()}
                      disabled={isRecording || countdown !== null}
                    >
                      <RotateCw className="h-3 w-3 mr-1" /> Refresh
                    </Button>
                  </div>
                </div>
                <div className={cn(
                  "p-5 bg-white border rounded-lg text-sm leading-relaxed text-slate-700 transition-all shadow-sm max-h-[200px] overflow-y-auto",
                  isRecording ? "ring-2 ring-red-500 border-transparent shadow-md bg-red-50/10" : "border-slate-200"
                )}>
                  {currentScript}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 w-full md:w-48 pt-2 flex-shrink-0">
                <div className="text-center">
                  <h3 className="text-xs font-bold uppercase tracking-tight">
                    {isRecording ? "Recording..." : "New Sample"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {isRecording 
                      ? `Time: ${formatTime(recordingTime)}` 
                      : audioBlobs.length >= 5 ? "Limit reached" : "Start reading."}
                  </p>
                </div>

                <div className="w-32">
                  <Progress value={progress} className="h-1.5" />
                </div>

                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className={cn(
                    "rounded-full h-16 w-16 p-0 shadow-xl mt-2 transition-all active:scale-95",
                    isRecording && "animate-pulse"
                  )}
                  onClick={isRecording ? stopRecording : startRecordingFlow}
                  disabled={!isRecording && (audioBlobs.length >= 5 || countdown !== null)}
                >
                  {isRecording ? <Square className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center p-8 mt-0 space-y-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="text-center">
                <h3 className="text-sm font-medium">Upload Audio Files</h3>
                <p className="text-[11px] text-muted-foreground">
                  MP3, WAV, or M4A (Max 5 files, 10MB each).
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="audio/mpeg,audio/wav,audio/mp3,audio/x-wav,audio/mp4,audio/m4a"
                className="hidden"
              />

              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-none px-6 h-8 text-xs"
                disabled={audioBlobs.length >= 5}
              >
                Select Files
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* List of Samples */}
        {audioBlobs.length > 0 && (
          <div className="bg-white border-t p-4 space-y-2 max-h-[180px] overflow-y-auto">
            {audioBlobs.map((item, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center justify-between p-2.5 border rounded-none text-xs transition-colors",
                  isPlaying === index ? "bg-primary/5 border-primary/20" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-slate-100 p-1.5 rounded-full flex-shrink-0">
                    <FileAudio className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full"
                    onClick={() => togglePlayback(index)}
                  >
                    {isPlaying === index ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => deleteSample(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <audio
        ref={audioRef}
        onEnded={() => setIsSpeaking(null)}
        className="hidden"
      />
      
      <p className="text-[11px] text-center text-muted-foreground px-4 italic">
        {activeTab === "record" 
          ? "Tip: Provide multiple samples for even better voice quality." 
          : "Tip: Clear recordings with minimal background noise work best."}
      </p>
    </div>
  );
}
