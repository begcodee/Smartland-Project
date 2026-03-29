import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Camera, Shield, CheckCircle, Clock,
  FileImage, User, CreditCard, RotateCcw,
  Scan
} from 'lucide-react';
import { toast } from 'sonner';
import {
  normalizeGhanaCardNumber,
  isValidGhanaCardFormat,
  validateFullNameAsOnCard,
  GHANA_CARD_FORMAT_HINT
} from '@/lib/ghanaCardValidation';
import { api } from '@/lib/api';
import { VerificationTimelineDialog } from '@/components/VerificationTimelineDialog';

interface GhanaCardVerificationProps {
  onVerificationComplete: (verificationData: VerificationData) => void;
  userCountry: string;
}

export interface VerificationData {
  frontCardImage: string;
  backCardImage: string;
  faceImage: string;
  cardNumber: string;
  fullName: string;
  status: 'pending' | 'verified' | 'rejected';
  faceMatch?: boolean;
  livenessPassed?: boolean;
  selfieSource?: 'live_camera' | 'upload';
  requiresManualReview?: boolean;
  niaReferenceId?: string;
}

const CARD_NAMES: Record<string, string> = {
  GH: 'Ghana Card',
  NG: 'National ID Card',
  KE: 'Huduma Namba',
  ZA: 'Smart ID Card',
  EG: 'National ID Card',
  MA: 'CNIE (Carte Nationale)',
  ET: 'Ethiopian ID',
  TZ: 'National ID',
  UG: 'National ID',
  RW: 'National ID'
};

export const GhanaCardVerification = ({ onVerificationComplete, userCountry }: GhanaCardVerificationProps) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<'front' | 'back' | 'details'>('front');
  const [frontCard, setFrontCard] = useState<string>('');
  const [backCard, setBackCard] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  /** live_camera = screened; upload = manual review only */
  const [faceCaptureMethod, setFaceCaptureMethod] = useState<'live_camera' | 'upload' | null>(null);
  const [faceScreeningDone, setFaceScreeningDone] = useState(false);
  const [faceScreeningMessage, setFaceScreeningMessage] = useState<string>('');
  const [requiresManualReview, setRequiresManualReview] = useState(false);
  const [faceRecognitionStep, setFaceRecognitionStep] = useState<'extracting' | 'comparing' | 'liveness' | 'done' | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] = useState<VerificationData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cardName = CARD_NAMES[userCountry] || 'National ID Card';

  const stopCamera = useCallback(() => {
    cameraStream?.getTracks().forEach(track => track.stop());
    setCameraStream(null);
  }, [cameraStream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const runScreeningForFace = useCallback(
    async (faceDataUrl: string, method: 'live_camera' | 'upload') => {
      if (!frontCard || !backCard) return;
      const normalized = normalizeGhanaCardNumber(cardNumber);
      if (!isValidGhanaCardFormat(normalized)) {
        toast.error(GHANA_CARD_FORMAT_HINT);
        return;
      }
      if (!validateFullNameAsOnCard(fullName)) {
        toast.error('Enter your full name as printed on the card (e.g. first and last name).');
        return;
      }

      setIsProcessing(true);
      setFaceRecognitionStep('extracting');
      setFaceScreeningDone(false);
      setRequiresManualReview(false);
      setFaceScreeningMessage('');

      await new Promise((r) => setTimeout(r, 400));
      setFaceRecognitionStep('comparing');
      await new Promise((r) => setTimeout(r, 500));
      setFaceRecognitionStep('liveness');
      await new Promise((r) => setTimeout(r, 500));

      try {
        const res = await api.verifyGhanaCard({
          cardNumber: normalized,
          fullName: fullName.trim(),
          frontCardImage: frontCard,
          backCardImage: backCard,
          faceImage: faceDataUrl,
          selfieSource: method === 'upload' ? 'upload' : 'live_camera'
        });

        if (!res.success) {
          setFaceRecognitionStep(null);
          toast.error(res.message || 'Verification check failed');
          return;
        }

        setFaceRecognitionStep('done');
        if (res.pendingManualReview) {
          setRequiresManualReview(true);
          setFaceScreeningDone(true);
          setFaceScreeningMessage(res.message || 'Your submission will be reviewed by Ghana Lands Commission.');
          toast.info(res.message || 'Manual review required for uploaded selfie.');
        } else if (res.preScreeningPassed) {
          setRequiresManualReview(false);
          setFaceScreeningDone(true);
          setFaceScreeningMessage(res.message || 'Screening passed; final approval is still required.');
          toast.success('Live capture accepted for screening.');
        } else {
          setFaceScreeningDone(false);
          toast.error(res.message || 'Could not complete screening.');
        }
      } catch (e) {
        setFaceRecognitionStep(null);
        toast.error(e instanceof Error ? e.message : 'Verification request failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [frontCard, backCard, cardNumber, fullName]
  );

  const handleFileUpload = (file: File, type: 'front' | 'back' | 'face') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'front') setFrontCard(result);
      else if (type === 'back') setBackCard(result);
      else {
        setFaceImage(result);
        setFaceCaptureMethod('upload');
        setFaceScreeningDone(false);
        setRequiresManualReview(false);
        void runScreeningForFace(result, 'upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      return true;
    } catch {
      toast.error('Camera access denied or not available.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!cameraStream || !videoRef.current) return;
    videoRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  const captureFromCamera = useCallback(
    (type: 'front' | 'back' | 'face') => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (type === 'front') setFrontCard(dataUrl);
      else if (type === 'back') setBackCard(dataUrl);
      else {
        setFaceImage(dataUrl);
        setFaceCaptureMethod('live_camera');
        setFaceScreeningDone(false);
        setRequiresManualReview(false);
        void runScreeningForFace(dataUrl, 'live_camera');
      }
      stopCamera();
      toast.success('Photo captured');
    },
    [stopCamera, runScreeningForFace]
  );

  const startFacialRecognition = async () => {
    const hasCamera = await startCamera('user');
    if (!hasCamera) return;
  };

  const captureSelfie = () => {
    captureFromCamera('face');
  };

  const retryFacialRecognition = () => {
    setFaceImage('');
    setFaceCaptureMethod(null);
    setFaceScreeningDone(false);
    setFaceRecognitionStep(null);
    setRequiresManualReview(false);
    setFaceScreeningMessage('');
    void startFacialRecognition();
  };

  const detailsValid =
    isValidGhanaCardFormat(normalizeGhanaCardNumber(cardNumber)) && validateFullNameAsOnCard(fullName);

  const submitVerification = async () => {
    if (!faceImage || !faceScreeningDone) {
      toast.error('Complete facial screening first.');
      return;
    }
    const normalized = normalizeGhanaCardNumber(cardNumber);
    if (!isValidGhanaCardFormat(normalized) || !validateFullNameAsOnCard(fullName)) {
      toast.error(GHANA_CARD_FORMAT_HINT);
      return;
    }

    setIsProcessing(true);
    try {
      const verificationData: VerificationData = {
        frontCardImage: frontCard,
        backCardImage: backCard,
        faceImage,
        cardNumber: normalized,
        fullName: fullName.trim(),
        status: 'pending',
        faceMatch: requiresManualReview ? false : true,
        livenessPassed: faceCaptureMethod === 'live_camera',
        selfieSource: faceCaptureMethod ?? undefined,
        requiresManualReview,
        niaReferenceId: undefined
      };

      await api.saveIdVerification(verificationData as unknown as Record<string, unknown>);
      setPendingSubmitPayload(verificationData);
      setTimelineOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const progressValue = step === 1 ? (subStep === 'front' ? 15 : subStep === 'back' ? 35 : 55) : step === 2 ? 75 : 100;

  return (
    <>
    <Card className="w-full max-w-2xl mx-auto bg-card text-card-foreground border border-border shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-primary" />
          {cardName} Verification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Front and back of your card plus a face match. Payment and access use Ghana Cedis and staff approval — you do not need cryptocurrency.
        </CardDescription>
        <Progress value={progressValue} className="h-2 bg-muted" />
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <Alert className="border-border bg-muted/50">
              <CreditCard className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Upload or capture <strong>front</strong> and <strong>back</strong> of your {cardName}. For Ghana, the card number on the front must match{' '}
                <span className="font-mono text-sm">GHA-XXXXXXXXX-X</span>.
              </AlertDescription>
            </Alert>

            {subStep === 'front' && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-foreground">
                  <FileImage className="w-4 h-4" />
                  Front of {cardName}
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                  {frontCard ? (
                    <div className="space-y-3">
                      <img src={frontCard} alt="Front of card" className="max-h-40 mx-auto rounded-lg object-contain border border-border" />
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="border border-border">
                          <CheckCircle className="w-3 h-3 mr-1" /> Captured
                        </Badge>
                        <Button type="button" variant="outline" size="sm" onClick={() => setFrontCard('')}>
                          <RotateCcw className="w-3 h-3 mr-1" /> Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Take a photo or upload the front of your card</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={() => startCamera('environment').then(() => {})}>
                          <Camera className="w-4 h-4 mr-2" /> Use camera
                        </Button>
                        <Label className="cursor-pointer">
                          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background px-4 py-2 hover:bg-muted">
                            <Upload className="w-4 h-4 mr-2" /> Upload
                          </span>
                          <Input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')} />
                        </Label>
                      </div>
                    </div>
                  )}
                  {cameraStream && (
                    <div className="mt-4 space-y-2">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-48 rounded-lg bg-black border border-border" />
                      <canvas ref={canvasRef} className="hidden" />
                      <Button type="button" onClick={() => captureFromCamera('front')} className="w-full">
                        <Scan className="w-4 h-4 mr-2" /> Capture photo
                      </Button>
                    </div>
                  )}
                </div>
                <Button onClick={() => { stopCamera(); setSubStep('back'); }} disabled={!frontCard} className="w-full">
                  Next: Back of card
                </Button>
              </div>
            )}

            {subStep === 'back' && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-foreground">
                  <FileImage className="w-4 h-4" />
                  Back of {cardName}
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                  {backCard ? (
                    <div className="space-y-3">
                      <img src={backCard} alt="Back of card" className="max-h-40 mx-auto rounded-lg object-contain border border-border" />
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="border border-border">
                          <CheckCircle className="w-3 h-3 mr-1" /> Captured
                        </Badge>
                        <Button type="button" variant="outline" size="sm" onClick={() => setBackCard('')}>
                          <RotateCcw className="w-3 h-3 mr-1" /> Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Take a photo or upload the back of your card</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={() => startCamera('environment').then(() => {})}>
                          <Camera className="w-4 h-4 mr-2" /> Use camera
                        </Button>
                        <Label className="cursor-pointer">
                          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background px-4 py-2 hover:bg-muted">
                            <Upload className="w-4 h-4 mr-2" /> Upload
                          </span>
                          <Input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')} />
                        </Label>
                      </div>
                    </div>
                  )}
                  {cameraStream && (
                    <div className="mt-4 space-y-2">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-48 rounded-lg bg-black border border-border" />
                      <canvas ref={canvasRef} className="hidden" />
                      <Button type="button" onClick={() => captureFromCamera('back')} className="w-full">
                        <Scan className="w-4 h-4 mr-2" /> Capture photo
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { stopCamera(); setSubStep('front'); }}>
                    Back
                  </Button>
                  <Button onClick={() => { stopCamera(); setSubStep('details'); }} disabled={!backCard} className="flex-1">
                    Next: Your details
                  </Button>
                </div>
              </div>
            )}

            {subStep === 'details' && (
              <div className="space-y-4">
                <Label className="text-foreground">Card number & name (as on card)</Label>
                <p className="text-xs text-muted-foreground">{GHANA_CARD_FORMAT_HINT}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="GHA-123456789-1"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                  <Input
                    placeholder="Full name as on card"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSubStep('back')}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!detailsValid}
                    className="flex-1"
                  >
                    Continue to facial recognition
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <User className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              <AlertTitle className="text-amber-900 dark:text-amber-200">Facial check</AlertTitle>
              <AlertDescription className="text-amber-900/90 dark:text-amber-100/90">
                <strong>Recommended:</strong> use the live camera so we know the photo was taken in this session. If you upload a file instead,{' '}
                <strong>Ghana Lands Commission must manually review</strong> it — your account will stay restricted until then. Random or unrelated images will be rejected.
              </AlertDescription>
            </Alert>

            {!faceImage ? (
              <div className="space-y-4">
                <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden bg-muted border-4 border-dashed border-primary/40">
                  {cameraStream ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 pointer-events-none rounded-full border-4 border-primary/40" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                      <User className="w-16 h-16 mb-2 opacity-80" />
                      <p className="text-sm">Position your face in the frame</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {!cameraStream ? (
                    <>
                      <Button onClick={() => void startFacialRecognition()} className="w-full">
                        <Camera className="w-4 h-4 mr-2" /> Start camera (recommended)
                      </Button>
                      <Label className="cursor-pointer text-center py-2 rounded-md border border-dashed border-border hover:bg-muted/50">
                        <span className="text-sm text-foreground">Upload a selfie instead (manual review required)</span>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'face')}
                        />
                      </Label>
                    </>
                  ) : (
                    <>
                      <Button onClick={captureSelfie} className="w-full">
                        <Scan className="w-4 h-4 mr-2" /> Capture selfie
                      </Button>
                      <Button variant="ghost" onClick={stopCamera} className="text-muted-foreground">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="flex justify-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Card photo</p>
                    <img src={frontCard} alt="ID" className="w-24 h-24 rounded-lg object-cover border border-border" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Your selfie</p>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-border">
                      <img src={faceImage} alt="Selfie" className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-3 text-left max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${faceRecognitionStep === 'extracting' ? 'bg-primary animate-pulse' : 'bg-emerald-600'}`} />
                      <span className="text-sm text-foreground">{faceRecognitionStep === 'extracting' ? 'Checking card data…' : 'Checked'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${faceRecognitionStep === 'comparing' ? 'bg-primary animate-pulse' : faceRecognitionStep && faceRecognitionStep !== 'extracting' ? 'bg-emerald-600' : 'bg-muted'}`} />
                      <span className="text-sm text-foreground">Server screening…</span>
                    </div>
                    <Progress
                      value={faceRecognitionStep === 'extracting' ? 33 : faceRecognitionStep === 'comparing' ? 66 : faceRecognitionStep === 'liveness' ? 90 : 100}
                      className="h-2 bg-muted"
                    />
                  </div>
                )}

                {faceScreeningDone && (
                  <Alert className={requiresManualReview ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/25' : 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/25'}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-foreground text-left text-sm">
                      {faceScreeningMessage}
                      {requiresManualReview && (
                        <span className="block mt-2 font-medium">Your account will remain limited until staff completes this review.</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 justify-center flex-wrap">
                  <Button variant="outline" onClick={() => void retryFacialRecognition()} disabled={isProcessing}>
                    Retake selfie
                  </Button>
                  {faceScreeningDone && (
                    <Button onClick={() => setStep(3)}>Continue to submit</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Submit for review</h3>
            <p className="text-muted-foreground text-sm">
              Your details are sent to Ghana Lands Commission. <strong className="text-foreground">You are not verified yet</strong> — staff must approve your account before transactions unlock.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <FileImage className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-foreground font-medium">Card images</p>
                <p className="text-xs text-muted-foreground">Uploaded</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <Camera className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-foreground font-medium">Face</p>
                <p className="text-xs text-muted-foreground">{requiresManualReview ? 'Manual review' : 'Live screening'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <Shield className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-foreground font-medium">Status</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Pending approval</p>
              </div>
            </div>
            <Alert className="border-border bg-muted/40 text-left">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-foreground">
                After you submit, Ghana Lands Commission and (where applicable) NIA will review your details. Expect an email within{' '}
                <strong>24 to 48 hours</strong> — not instant verification. Land payments use Paystack in Ghana Cedis (no crypto wallet).
              </AlertDescription>
            </Alert>
            <Button onClick={() => void submitVerification()} disabled={isProcessing} className="w-full">
              {isProcessing ? 'Submitting…' : 'Submit for Ghana Lands Commission review'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

      <VerificationTimelineDialog
        open={timelineOpen}
        onOpenChange={(open) => {
          setTimelineOpen(open);
          if (!open && pendingSubmitPayload) {
            onVerificationComplete(pendingSubmitPayload);
            setPendingSubmitPayload(null);
          }
        }}
        context="ghana_card_submitted"
      />
    </>
  );
};
