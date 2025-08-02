import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Zap,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Play,
  Edit,
  Award,
  BarChart3,
  Clock,
  Brain,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  AdminStats,
  Drawing,
  LotteryTicket,
  ApiResponse,
  JackpotUpdateRequest,
} from "@shared/types";
import { toast } from "sonner";

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [latestCompletedDrawing, setLatestCompletedDrawing] = useState<Drawing | null>(null);
  const [allTickets, setAllTickets] = useState<LotteryTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [jackpotUpdateAmount, setJackpotUpdateAmount] = useState("");
  const [isJackpotDialogOpen, setIsJackpotDialogOpen] = useState(false);
  const [manualNumbers, setManualNumbers] = useState({
    main: "",
    world: "",
  });
  const [intelligentDrawingEnabled, setIntelligentDrawingEnabled] = useState(true);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);
  const [autoDrawingEnabled, setAutoDrawingEnabled] = useState(true);
  const [nextDrawingTime, setNextDrawingTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [manualDateOverride, setManualDateOverride] = useState("");
  const [manualTimeOverride, setManualTimeOverride] = useState("");
  const [manualTitleOverride, setManualTitleOverride] = useState("");

  // Redirect if not admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {};

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const [statsResponse, drawingResponse, latestDrawingResponse, ticketsResponse, autoDrawingResponse] =
        await Promise.all([
          fetch("/api/demo/admin-stats", { headers }),
          fetch("/api/lottery/current-drawing", { headers }),
          fetch("/api/lottery/latest-completed-drawing"),
          fetch("/api/demo/all-tickets", { headers }),
          fetch("/api/auto-drawing/status"),
        ]);

      const statsData: ApiResponse<AdminStats> = statsResponse.ok
        ? await statsResponse.json()
        : { success: false };
      const drawingData: ApiResponse<Drawing> = drawingResponse.ok
        ? await drawingResponse.json()
        : { success: false };
      const latestDrawingData: ApiResponse<Drawing> = latestDrawingResponse.ok
        ? await latestDrawingResponse.json()
        : { success: false };
      const ticketsData: ApiResponse<LotteryTicket[]> = ticketsResponse.ok
        ? await ticketsResponse.json()
        : { success: false };
      const autoDrawingData: ApiResponse<any> = autoDrawingResponse.ok
        ? await autoDrawingResponse.json()
        : { success: false };

      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }

      if (drawingData.success && drawingData.data) {
        setCurrentDrawing(drawingData.data);
        setJackpotUpdateAmount(drawingData.data.jackpotAmount.toString());
      }

      if (latestDrawingData.success && latestDrawingData.data) {
        setLatestCompletedDrawing(latestDrawingData.data);
      }

      if (ticketsData.success && ticketsData.data) {
        setAllTickets(ticketsData.data);
      }

      if (autoDrawingData.success && autoDrawingData.data) {
        setAutoDrawingEnabled(autoDrawingData.data.enabled);
        if (autoDrawingData.data.nextScheduledTime) {
          setNextDrawingTime(new Date(autoDrawingData.data.nextScheduledTime));
        }
        setCountdown(autoDrawingData.data.countdown);
      }

      // Fetch display overrides
      try {
        const overridesResponse = await fetch("/api/display-overrides");
        if (overridesResponse.ok) {
          const overridesData = await overridesResponse.json();
          if (overridesData.success && overridesData.data) {
            setManualTitleOverride(overridesData.data.manualTitle || "");
            setManualDateOverride(overridesData.data.manualDate || "");
            setManualTimeOverride(overridesData.data.manualTime || "");
          }
        }
      } catch (error) {
        console.error("Error fetching display overrides:", error);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Error loading admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawing = async () => {
    setIsDrawing(true);
    try {
      let requestBody: any = {
        intelligentDrawing: intelligentDrawingEnabled,
      };

      // Parse manual numbers if provided
      if (manualNumbers.main && manualNumbers.world) {
        const mainNums = manualNumbers.main
          .split(",")
          .map((n) => parseInt(n.trim()))
          .filter((n) => !isNaN(n));
        const worldNums = manualNumbers.world
          .split(",")
          .map((n) => parseInt(n.trim()))
          .filter((n) => !isNaN(n));

        if (mainNums.length === 5 && worldNums.length === 2) {
          requestBody.manualNumbers = {
            mainNumbers: mainNums,
            worldNumbers: worldNums,
          };
        } else {
          toast.error(
            t('form.manualNumbersError'),
          );
          setIsDrawing(false);
          return;
        }
      }

      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/demo/perform-drawing", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const data: ApiResponse<Drawing> = response.ok
        ? await response.json()
        : { success: false, error: "Request failed" };

      if (data.success && data.data) {
        setCurrentDrawing(data.data);
        setManualNumbers({ main: "", world: "" });

        // Capture analysis results if intelligent drawing was used
        if (data.analysisResult) {
          setLastAnalysisResult(data.analysisResult);
        }

        const successMessage = intelligentDrawingEnabled ?
          t('admin.intelligentDrawingSuccess') :
          "Ziehung erfolgreich durchgeführt!";
        toast.success(successMessage);
        fetchAdminData(); // Refresh all data
      } else {
        toast.error(data.error || "Fehler bei der Ziehung");
      }
    } catch (error) {
      console.error("Error performing drawing:", error);
      toast.error("Fehler bei der Ziehung");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleAutoDrawingToggle = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/auto-drawing/toggle", {
        method: "POST",
        headers,
        body: JSON.stringify({ enabled: !autoDrawingEnabled }),
      });

      const data: ApiResponse<any> = response.ok
        ? await response.json()
        : { success: false, error: "Request failed" };

      if (data.success && data.data) {
        setAutoDrawingEnabled(data.data.enabled);
        if (data.data.nextScheduledTime) {
          setNextDrawingTime(new Date(data.data.nextScheduledTime));
        }
        setCountdown(data.data.countdown);
        toast.success(t('admin.autoDrawingToggleSuccess', { status: data.data.enabled ? t('admin.activated') : t('admin.deactivated') }));
      } else {
        toast.error(data.error || t('admin.autoDrawingToggleError'));
      }
    } catch (error) {
      console.error("Error toggling auto-drawing:", error);
      toast.error(t('admin.autoDrawingToggleError'));
    }
  };

  const handleJackpotUpdate = async () => {
    try {
      const newAmount = parseFloat(jackpotUpdateAmount);

      if (isNaN(newAmount) || newAmount < 0) {
        toast.error("Ungültiger Jackpot-Betrag");
        return;
      }

      const request: JackpotUpdateRequest = {
        newAmount,
        isSimulated: true,
      };

      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/demo/update-jackpot", {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      const data: ApiResponse<Drawing> = response.ok
        ? await response.json()
        : { success: false, error: "Request failed" };

      if (data.success && data.data) {
        setCurrentDrawing(data.data);
        setIsJackpotDialogOpen(false);
        toast.success("Jackpot erfolgreich aktualisiert!");
        fetchAdminData(); // Refresh all data
      } else {
        toast.error(data.error || "Fehler beim Aktualisieren des Jackpots");
      }
    } catch (error) {
      console.error("Error updating jackpot:", error);
      toast.error("Fehler beim Aktualisieren des Jackpots");
    }
  };

  const handleDisplayOverridesUpdate = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/display-overrides/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: manualTitleOverride || undefined,
          date: manualDateOverride || undefined,
          time: manualTimeOverride || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('admin.overridesSavedSuccess'));
      } else {
        toast.error(data.error || t('admin.overridesSaveError'));
      }
    } catch (error) {
      console.error("Error updating display overrides:", error);
      toast.error(t('admin.overridesSaveError'));
    }
  };

  const handleDisplayOverridesReset = async () => {
    setManualTitleOverride("");
    setManualDateOverride("");
    setManualTimeOverride("");

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/display-overrides/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: undefined,
          date: undefined,
          time: undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('admin.overridesResetSuccess'));
      } else {
        toast.error(data.error || t('admin.overridesResetError'));
      }
    } catch (error) {
      console.error("Error resetting display overrides:", error);
      toast.error(t('admin.overridesResetError'));
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("de-DE").format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-t-3xl min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black flex items-center space-x-3">
            <Settings className="h-8 w-8 text-yellow-600" />
            <span>{t('admin.title')}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.subtitle')}
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 {t('admin.instructions.title')}</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • {t('admin.instructions.editJackpot')}
              </li>
              <li>
                • {t('admin.instructions.startDrawing')}
              </li>
              <li>
                • {t('admin.instructions.manualNumbers')}
              </li>
              <li>
                ��� {t('admin.instructions.changes')}
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('admin.activeUsers')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('admin.soldTickets')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalTickets || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-700" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('common.totalRevenue')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge
                    variant={stats?.pendingDrawing ? "destructive" : "default"}
                  >
                    {stats?.pendingDrawing ? t('admin.drawingPending') : t('admin.ready')}
                  </Badge>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {/* Jackpot Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>{t('admin.jackpotControl')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    {t('admin.simulatedJackpot')}
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(currentDrawing?.simulatedJackpot || 0)}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {t('admin.adminControlled')}
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    {t('admin.realJackpot')}
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentDrawing?.realJackpot || 0)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {t('admin.percentRevenue')}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">{t('admin.displayedJackpot')}</h4>
                <p className="text-3xl font-bold text-blue-600 mb-4">
                  {formatCurrency(currentDrawing?.jackpotAmount || 0)}
                </p>

                <Dialog
                  open={isJackpotDialogOpen}
                  onOpenChange={setIsJackpotDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>{t('admin.editJackpot')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('admin.editJackpotAmount')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="jackpot-amount">
                          {t('admin.newJackpotAmount')}
                        </Label>
                        <Input
                          id="jackpot-amount"
                          type="number"
                          value={jackpotUpdateAmount}
                          onChange={(e) =>
                            setJackpotUpdateAmount(e.target.value)
                          }
                          placeholder="z.B. 10000000"
                        />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Warnung:</strong> Diese Änderung wird sofort
                          auf der Hauptseite sichtbar sein.
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleJackpotUpdate}
                          className="flex-1"
                        >
                          {t('admin.confirm')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsJackpotDialogOpen(false)}
                          className="flex-1"
                        >
                          {t('admin.cancel')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Drawing Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>{t('admin.drawingControl')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestCompletedDrawing && latestCompletedDrawing.mainNumbers.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3">{t('admin.lastWinningNumbers')}</h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex space-x-2">
                      {latestCompletedDrawing.mainNumbers.map((number, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                    <span className="text-lg font-bold">+</span>
                    <div className="flex space-x-2">
                      {latestCompletedDrawing.worldNumbers.map((number, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Winners by Class */}
                  {Object.keys(latestCompletedDrawing.winnersByClass).length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">
                        {t('admin.winnersByClass')}
                      </h5>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {Object.entries(latestCompletedDrawing.winnersByClass).map(
                          ([winClass, count]) => (
                            <div
                              key={winClass}
                              className="flex justify-between"
                            >
                              <span>Klasse {winClass}:</span>
                              <span className="font-bold">{count}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">
                    {t('admin.noDrawingPerformed')}
                  </p>
                  <Badge variant="destructive">{t('admin.drawingPending')}</Badge>
                </div>
              )}

              <Separator />

              {/* Intelligent Drawing Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">{t('admin.intelligentDrawing')}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('admin.intelligentDrawingDesc')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={intelligentDrawingEnabled}
                    onCheckedChange={setIntelligentDrawingEnabled}
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {intelligentDrawingEnabled
                      ? t('admin.intelligentDrawingEnabled')
                      : t('admin.intelligentDrawingDisabled')
                    }
                  </p>
                </div>
              </div>

              <Separator />

              {/* Analysis Results Display */}
              {lastAnalysisResult && intelligentDrawingEnabled && (
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>{t('admin.lastAnalysis')}</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-purple-700">
                        📊 <strong>{lastAnalysisResult.totalTicketsAnalyzed}</strong> {t('admin.ticketsAnalyzed')}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="font-medium text-purple-800 mb-1">{t('admin.selectedMainNumbers')}</p>
                          <div className="flex space-x-1">
                            {lastAnalysisResult.leastFrequentMain?.map((num: number, index: number) => (
                              <div
                                key={index}
                                className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-purple-600 mt-1">
                            ↳ {t('admin.rarestNumbers')}
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-purple-800 mb-1">{t('admin.selectedWorldNumbers')}</p>
                          <div className="flex space-x-1">
                            {lastAnalysisResult.leastFrequentWorld?.map((num: number, index: number) => (
                              <div
                                key={index}
                                className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xs font-bold"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-purple-600 mt-1">
                            ↳ {t('admin.minimizedWinners')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {lastAnalysisResult && intelligentDrawingEnabled && <Separator />}

              <div>
                <h4 className="font-semibold mb-3">
                  {t('admin.manualNumbers')}
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="manual-main">
                      {t('form.fiveMainNumbers')}
                    </Label>
                    <Input
                      id="manual-main"
                      value={manualNumbers.main}
                      onChange={(e) =>
                        setManualNumbers({
                          ...manualNumbers,
                          main: e.target.value,
                        })
                      }
                      placeholder="z.B. 7,14,21,35,42"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manual-world">
                      2 WorldZahlen (1-12, kommagetrennt)
                    </Label>
                    <Input
                      id="manual-world"
                      value={manualNumbers.world}
                      onChange={(e) =>
                        setManualNumbers({
                          ...manualNumbers,
                          world: e.target.value,
                        })
                      }
                      placeholder="z.B. 3,9"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDrawing}
                disabled={isDrawing}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>
                  {isDrawing ? t('admin.drawingInProgress') : t('admin.startDrawing')}
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Auto-Drawing Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{t('admin.automaticDrawing')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{t('admin.autoDrawing')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('common.everyFridayAt21')}
                  </p>
                </div>
                <button
                  onClick={handleAutoDrawingToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    autoDrawingEnabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {autoDrawingEnabled ? (
                    <ToggleRight className="h-6 w-6" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              <Separator />

              {nextDrawingTime && (
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('admin.nextDrawing')}</h4>
                  <div className="text-sm text-gray-700">
                    {new Date(nextDrawingTime).toLocaleString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* Countdown */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">{t('admin.timeUntilDrawing')}</span>
                    </div>
                    <div className="flex space-x-1 font-mono text-lg font-bold mt-2">
                      {countdown.days > 0 && (
                        <>
                          <div className="bg-amber-100 px-2 py-1 rounded text-amber-800">
                            {countdown.days.toString().padStart(2, '0')}
                          </div>
                          <span className="text-amber-600 self-center">d</span>
                        </>
                      )}
                      <div className="bg-amber-100 px-2 py-1 rounded text-amber-800">
                        {countdown.hours.toString().padStart(2, '0')}
                      </div>
                      <span className="text-amber-600 self-center">:</span>
                      <div className="bg-amber-100 px-2 py-1 rounded text-amber-800">
                        {countdown.minutes.toString().padStart(2, '0')}
                      </div>
                      <span className="text-amber-600 self-center">:</span>
                      <div className="bg-amber-100 px-2 py-1 rounded text-amber-800">
                        {countdown.seconds.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  {autoDrawingEnabled
                    ? t('common.autoDrawingEnabled')
                    : t('common.autoDrawingDisabled')
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Overrides Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>{t('admin.displayOverrides')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="manual-title">{t('admin.manualTitle')}</Label>
                  <Input
                    id="manual-title"
                    value={manualTitleOverride}
                    onChange={(e) => setManualTitleOverride(e.target.value)}
                    placeholder={t('hero.nextChance')}
                  />
                </div>
                <div>
                  <Label htmlFor="manual-date">{t('admin.manualDate')}</Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualDateOverride}
                    onChange={(e) => setManualDateOverride(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="manual-time">{t('admin.manualTime')}</Label>
                  <Input
                    id="manual-time"
                    type="time"
                    value={manualTimeOverride}
                    onChange={(e) => setManualTimeOverride(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {t('admin.overrideNote')}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleDisplayOverridesUpdate}
                  className="flex-1"
                >
                  {t('admin.save')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDisplayOverridesReset}
                  className="flex-1"
                >
                  {t('admin.reset')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {t('admin.recentTickets')} ({allTickets.length} {t('admin.total')})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allTickets.slice(0, 50).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <div className="font-semibold">
                        #{ticket.id.slice(-6)}
                      </div>
                      <div className="text-gray-500">
                        {t('admin.user')} {ticket.userId.slice(-6)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {ticket.mainNumbers.map((number, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold"
                          >
                            {number}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm">+</span>
                      <div className="flex space-x-1">
                        {ticket.worldNumbers.map((number, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold"
                          >
                            {number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatCurrency(ticket.cost)}
                    </div>
                    {ticket.isWinner && (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        {t('admin.winnerClass')} {ticket.winningClass}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F402154b5f0d94c8e8de8b82354390da9%2F1efa9d49721f44139fbd3c83fab3a610?format=webp&width=800"
              alt="World Jackpot Logo"
              className="h-32 w-auto mb-6 mx-auto drop-shadow-2xl filter brightness-110 contrast-110 saturate-110 animate-pulse"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(218, 165, 32, 0.8)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 60px rgba(184, 134, 11, 0.3))',
                animation: 'pulse 2s infinite'
              }}
            />
            <p className="text-gray-300 text-sm">{t('footer.adminDashboard')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
