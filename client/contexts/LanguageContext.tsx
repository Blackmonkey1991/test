import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'de';

interface LanguageData {
  [key: string]: { [key: string]: string };
}

export const languageData: LanguageData = {
  en: {
    'admin.reset': 'Reset',
    'admin.overrideNote': 'Note: These changes will override the automatic date/time display on the main page.',
    'admin.manualNumbers': 'Manual numbers (optional)',
    'admin.lastWinningNumbers': 'Last Winning Numbers',
    'admin.winnersByClass': 'Winners by Class',
    'admin.overridesSavedSuccess': 'Display overrides saved successfully!',
    'admin.overridesSaveError': 'Error saving overrides',
    'admin.jackpotControl': 'Jackpot Control',
    'admin.simulatedJackpot': 'Simulated Jackpot',
    'admin.adminControlled': 'Admin controlled',
    'admin.realJackpot': 'Real Jackpot',
    'admin.percentRevenue': '40% of revenue',
    'admin.displayedJackpot': 'Displayed Jackpot',
    'admin.editJackpot': 'Edit Jackpot',
    'admin.editJackpotAmount': 'Edit Jackpot Amount',
    'admin.newJackpotAmount': 'New Jackpot Amount (€)',
    'admin.confirm': 'Confirm',
    'admin.cancel': 'Cancel',
    'admin.drawingControl': 'Drawing Control',
    'admin.noDrawingPerformed': 'No drawing performed',
    'admin.drawingPending': 'Drawing pending',
    'admin.ready': 'Ready',
    'admin.startDrawing': 'Start Drawing',
    'admin.drawingInProgress': 'Drawing in progress...',
    'admin.autoDrawing': 'Auto Drawing',
    'admin.automaticDrawing': 'Automatic Drawing',
    'admin.nextDrawing': 'Next Drawing',
    'admin.timeUntilDrawing': 'Time until drawing:',
    'admin.recentTickets': 'Recent Tickets',
    'admin.total': 'total',
    'admin.autoDrawingToggleSuccess': 'Auto-drawing {status}!',
    'admin.autoDrawingToggleError': 'Error toggling auto-drawing',
    'form.submitError': 'Error submitting lottery tickets',
    'form.ticketNumber': 'Lottery Ticket {number}',
    'form.twoWorldNumbers': '2 out of 12 World Numbers',
    'form.ticketComplete': 'Ticket complete',
    'form.addAnother': 'Add another ticket',
    'format.timeAt': 'at {time}',
    'admin.user': 'User:',
    'admin.winnerClass': 'Winner Cl.'
  },
  de: {
    'admin.reset': 'Zurücksetzen',
    'admin.overrideNote': 'Hinweis: Diese Änderungen überschreiben die automatische Datum/Zeit-Anzeige auf der Hauptseite.',
    'admin.manualNumbers': 'Manuelle Zahlen (optional)',
    'admin.lastWinningNumbers': 'Letzte Gewinnzahlen',
    'admin.winnersByClass': 'Gewinner nach Klassen',
    'admin.overridesSavedSuccess': 'Anzeige-Überschreibungen erfolgreich gespeichert!',
    'admin.overridesSaveError': 'Fehler beim Speichern der Überschreibungen',
    'admin.jackpotControl': 'Jackpot-Kontrolle',
    'admin.simulatedJackpot': 'Simulierter Jackpot',
    'admin.adminControlled': 'Von Admin kontrolliert',
    'admin.realJackpot': 'Echter Jackpot',
    'admin.percentRevenue': '40% der Einnahmen',
    'admin.displayedJackpot': 'Angezeigter Jackpot',
    'admin.editJackpot': 'Jackpot bearbeiten',
    'admin.editJackpotAmount': 'Jackpot-Betrag bearbeiten',
    'admin.newJackpotAmount': 'Neuer Jackpot-Betrag (€)',
    'admin.confirm': 'Bestätigen',
    'admin.cancel': 'Abbrechen',
    'admin.drawingControl': 'Ziehungs-Kontrolle',
    'admin.noDrawingPerformed': 'Keine Ziehung durchgeführt',
    'admin.drawingPending': 'Ziehung ausstehend',
    'admin.ready': 'Bereit',
    'admin.startDrawing': 'Ziehung starten',
    'admin.drawingInProgress': 'Ziehung läuft...',
    'admin.autoDrawing': 'Auto-Ziehung',
    'admin.automaticDrawing': 'Automatische Ziehung',
    'admin.nextDrawing': 'Nächste Ziehung',
    'admin.timeUntilDrawing': 'Zeit bis zur Ziehung:',
    'admin.recentTickets': 'Letzte Spielscheine',
    'admin.total': 'insgesamt',
    'admin.autoDrawingToggleSuccess': 'Auto-Ziehung {status}!',
    'admin.autoDrawingToggleError': 'Fehler beim Umschalten der Auto-Ziehung',
    'form.submitError': 'Fehler beim Abgeben der Spielscheine',
    'form.ticketNumber': 'Spielschein {number}',
    'form.twoWorldNumbers': '2 aus 12 WorldZahlen',
    'form.ticketComplete': 'Schein vollständig',
    'form.addAnother': 'Weiteren Schein hinzufügen',
    'format.timeAt': 'um {time} Uhr',
    'admin.user': 'User:',
    'admin.winnerClass': 'Gewinner Kl.'
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return languageData[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
