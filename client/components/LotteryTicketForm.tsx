import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiResponse, TicketPurchaseRequest } from "@shared/types";
import { toast } from "sonner";
import { Trash2, Plus, Shuffle } from "lucide-react";

interface LotteryTicketFormProps {
  onTicketPurchased: () => void;
}

interface TicketData {
  id: string;
  mainNumbers: number[];
  worldNumbers: number[];
}

const LotteryTicketForm: React.FC<LotteryTicketFormProps> = ({
  onTicketPurchased,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<TicketData[]>([
    { id: "1", mainNumbers: [], worldNumbers: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomNumbers = (
    min: number,
    max: number,
    count: number,
    exclude: number[] = [],
  ): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num) && !exclude.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const addTicket = () => {
    if (tickets.length >= 10) {
      toast.error(t('form.maxTicketsError'));
      return;
    }

    const newTicket: TicketData = {
      id: Date.now().toString(),
      mainNumbers: [],
      worldNumbers: [],
    };
    setTickets([...tickets, newTicket]);
  };

  const removeTicket = (ticketId: string) => {
    if (tickets.length === 1) {
      setTickets([{ id: "1", mainNumbers: [], worldNumbers: [] }]);
    } else {
      setTickets(tickets.filter((t) => t.id !== ticketId));
    }
  };

  const updateTicketNumbers = (
    ticketId: string,
    type: "main" | "world",
    numbers: number[],
  ) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              [type === "main" ? "mainNumbers" : "worldNumbers"]: numbers,
            }
          : ticket,
      ),
    );
  };

  const quickPick = (ticketId: string) => {
    const mainNumbers = generateRandomNumbers(1, 50, 5);
    const worldNumbers = generateRandomNumbers(1, 12, 2);

    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, mainNumbers, worldNumbers }
          : ticket,
      ),
    );
  };

  const isTicketComplete = (ticket: TicketData): boolean => {
    return ticket.mainNumbers.length === 5 && ticket.worldNumbers.length === 2;
  };

  const getValidTickets = (): TicketData[] => {
    return tickets.filter(isTicketComplete);
  };

  const getTotalCost = (): number => {
    return getValidTickets().length * 2; // 2€ per ticket
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('form.loginRequired'));
      return;
    }

    const validTickets = getValidTickets();

    if (validTickets.length === 0) {
      toast.error(t('form.completeTicketError'));
      return;
    }

    const totalCost = getTotalCost();
    if (user.balance < totalCost) {
      toast.error(
        `Unzureichendes Guthaben. Benötigt: ${totalCost.toFixed(2)}€, Verfügbar: ${user.balance.toFixed(2)}€`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const request: TicketPurchaseRequest = {
        tickets: validTickets.map((ticket) => ({
          mainNumbers: ticket.mainNumbers,
          worldNumbers: ticket.worldNumbers,
        })),
      };

      const sessionToken = localStorage.getItem('sessionToken');

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch("/api/lottery/purchase-tickets", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(request),
      });

      const data: ApiResponse = response.ok
        ? await response.json()
        : { success: false, error: "Request failed" };

      if (data.success) {
        toast.success(
          t('form.submitSuccess', { count: validTickets.length }),
        );
        setTickets([{ id: "1", mainNumbers: [], worldNumbers: [] }]);
        onTicketPurchased();
      } else {
        toast.error(data.error || t('form.submitError'));
      }
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      toast.error(t('form.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const NumberSelector: React.FC<{
    title: string;
    selectedNumbers: number[];
    onNumbersChange: (numbers: number[]) => void;
    min: number;
    max: number;
    count: number;
    color: string;
  }> = ({
    title,
    selectedNumbers,
    onNumbersChange,
    min,
    max,
    count,
    color,
  }) => {
    const toggleNumber = (number: number) => {
      const newNumbers = selectedNumbers.includes(number)
        ? selectedNumbers.filter((n) => n !== number)
        : selectedNumbers.length < count
          ? [...selectedNumbers, number].sort((a, b) => a - b)
          : selectedNumbers;

      onNumbersChange(newNumbers);
    };

    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <div>
        <h4 className="font-semibold mb-3 text-gray-800">{title}</h4>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {numbers.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => toggleNumber(number)}
              className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all duration-200 ${
                selectedNumbers.includes(number)
                  ? `${color} border-transparent shadow-md`
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {number}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {selectedNumbers.length}/{count} ausgewählt
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {t('form.loginPrompt')}
          </p>
          <p className="text-sm text-gray-500">
            {t('form.accountBenefit')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.map((ticket, index) => (
        <Card key={ticket.id} className="relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('form.ticketNumber', { number: index + 1 })}</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickPick(ticket.id)}
                  className="flex items-center space-x-1"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Quicktipp</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTicket(ticket.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <NumberSelector
                title={t('form.mainNumbersSelector')}
                selectedNumbers={ticket.mainNumbers}
                onNumbersChange={(numbers) =>
                  updateTicketNumbers(ticket.id, "main", numbers)
                }
                min={1}
                max={50}
                count={5}
                color="bg-blue-600 text-white"
              />

              <NumberSelector
                title={t('form.twoWorldNumbers')}
                selectedNumbers={ticket.worldNumbers}
                onNumbersChange={(numbers) =>
                  updateTicketNumbers(ticket.id, "world", numbers)
                }
                min={1}
                max={12}
                count={2}
                color="bg-yellow-500 text-black"
              />
            </div>

            {isTicketComplete(ticket) && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-semibold">
                    {t('form.ticketComplete')}
                  </span>
                  <span className="text-green-800 font-bold">2,00€</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={addTicket}
          disabled={tickets.length >= 10}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('form.addAnother')}</span>
        </Button>

        <div className="text-right">
          <div className="text-sm text-gray-600">
            {t('form.validTickets', { valid: getValidTickets().length, total: tickets.length })}
          </div>
          <div className="text-lg font-bold">
            {t('form.totalCost', { cost: getTotalCost().toFixed(2) })}
          </div>
        </div>
      </div>

      {getValidTickets().length > 0 && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Ihr Guthaben: {user.balance.toFixed(2)}€</p>
              <p>
                Nach dem Kauf: {(user.balance - getTotalCost()).toFixed(2)}€
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || user.balance < getTotalCost()}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting
                ? t('form.submitting')
                : t('form.submitTickets', { count: getValidTickets().length })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default LotteryTicketForm;
