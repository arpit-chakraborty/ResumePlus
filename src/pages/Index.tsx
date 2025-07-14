import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FileUp, Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ResumeService, ResumeAnalysisResult } from "@/services/resumeService";

export default function ResumeCheckerApp() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setError(null);
    setResult(null);
    
    if (!selectedFile) {
      return;
    }
    
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use the ResumeService to analyze the resume
      const analysisResult = await ResumeService.analyzeResume(file);
      setResult(analysisResult);
    } catch (err) {
      setError("An error occurred while analyzing your resume. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Resume Analyzer</h1>
          <p className="text-lg text-muted-foreground mt-2">Improve your resume with AI-powered feedback</p>
        </header>

        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="tips">Resume Tips</TabsTrigger>
            <TabsTrigger value="analyzer">Resume Analyzer</TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Best Practices</CardTitle>
                <CardDescription>Follow these tips to create an effective resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Use action verbs
                  </h3>
                  <p className="text-muted-foreground">Begin bullet points with strong action verbs like "Achieved," "Implemented," or "Managed" rather than passive phrases.</p>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Quantify achievements
                  </h3>
                  <p className="text-muted-foreground">Use numbers and metrics to demonstrate your impact: "Increased sales by 20%" is better than "Increased sales significantly."</p>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Tailor to the job
                  </h3>
                  <p className="text-muted-foreground">Customize your resume for each position by highlighting relevant skills and experiences that match the job description.</p>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Keep it concise
                  </h3>
                  <p className="text-muted-foreground">Limit your resume to 1-2 pages and focus on the most relevant information. Recruiters typically spend only 6-7 seconds reviewing a resume.</p>
                </div>
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Use consistent formatting
                  </h3>
                  <p className="text-muted-foreground">Maintain consistency in font, spacing, bullet styles, and date formats throughout your resume.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Analyzer</CardTitle>
                <CardDescription>Upload your resume to get AI-powered feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                        <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Upload your resume in PDF format</p>
                        <Input 
                          id="resume" 
                          type="file" 
                          accept="application/pdf" 
                          onChange={handleFileChange}
                          className="max-w-sm"
                        />
                      </div>
                      
                      {file && (
                        <Alert variant="outline" className="mt-4 bg-blue-50">
                          <Info className="h-4 w-4" />
                          <AlertTitle>File selected</AlertTitle>
                          <AlertDescription>{file.name}</AlertDescription>
                        </Alert>
                      )}
                      
                      {error && (
                        <Alert variant="destructive" className="mt-4">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!file || isLoading}
                  >
                    {isLoading ? "Analyzing..." : "Analyze Resume"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analyzing your resume...</span>
                      <span className="text-sm font-medium">Please wait</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resume Score</span>
                    <span className="text-2xl font-bold">{result.score}/100</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Score Breakdown</h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Quality</span>
                        <span className="text-sm font-medium">{result.score}%</span>
                      </div>
                      <Progress value={result.score} className="h-2" />
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Areas for Improvement</h3>
                    <div className="space-y-4">
                      {result.improvements.map((item, index) => (
                        <Alert key={index} className="bg-amber-50">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <AlertTitle>{item.category}</AlertTitle>
                          <AlertDescription>
                            {item.suggestion}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Resume Strengths</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="text-muted-foreground">{strength}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}