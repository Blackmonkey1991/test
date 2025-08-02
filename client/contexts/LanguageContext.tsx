import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'de' | 'fr' | 'es' | 'it';

export const languageInfo = {
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  it: { name: "Italiano", flag: "🇮🇹" }
};

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
  },
  fr: {
    'admin.reset': 'Réinitialiser',
    'admin.overrideNote': 'Remarque : Ces modifications remplaceront l\'affichage automatique de la date/heure sur la page principale.',
    'admin.manualNumbers': 'Numéros manuels (optionnel)',
    'admin.lastWinningNumbers': 'Derniers numéros gagnants',
    'admin.winnersByClass': 'Gagnants par catégorie',
    'admin.overridesSavedSuccess': 'Remplacements d\'affichage enregistrés avec succès !',
    'admin.overridesSaveError': 'Erreur lors de l\'enregistrement des remplacements',
    'admin.jackpotControl': 'Contrôle du jackpot',
    'admin.simulatedJackpot': 'Jackpot simulé',
    'admin.adminControlled': 'Contrôlé par l\'administrateur',
    'admin.realJackpot': 'Jackpot réel',
    'admin.percentRevenue': '40% des recettes',
    'admin.displayedJackpot': 'Jackpot affiché',
    'admin.editJackpot': 'Modifier le jackpot',
    'admin.editJackpotAmount': 'Modifier le montant du jackpot',
    'admin.newJackpotAmount': 'Nouveau montant du jackpot (€)',
    'admin.confirm': 'Confirmer',
    'admin.cancel': 'Annuler',
    'admin.drawingControl': 'Contrôle du tirage',
    'admin.noDrawingPerformed': 'Aucun tirage effectué',
    'admin.drawingPending': 'Tirage en attente',
    'admin.ready': 'Prêt',
    'admin.startDrawing': 'Commencer le tirage',
    'admin.drawingInProgress': 'Tirage en cours...',
    'admin.autoDrawing': 'Tirage automatique',
    'admin.automaticDrawing': 'Tirage automatique',
    'admin.nextDrawing': 'Prochain tirage',
    'admin.timeUntilDrawing': 'Temps jusqu\'au tirage :',
    'admin.recentTickets': 'Billets récents',
    'admin.total': 'total',
    'admin.autoDrawingToggleSuccess': 'Tirage automatique {status} !',
    'admin.autoDrawingToggleError': 'Erreur lors du changement du tirage automatique',
    'form.submitError': 'Erreur lors de la soumission des billets de loterie',
    'form.ticketNumber': 'Billet de loterie {number}',
    'form.twoWorldNumbers': '2 sur 12 numéros mondiaux',
    'form.ticketComplete': 'Billet complet',
    'form.addAnother': 'Ajouter un autre billet',
    'format.timeAt': 'à {time}',
    'admin.user': 'Utilisateur :',
    'admin.winnerClass': 'Classe gagnante'
  },
  es: {
    'admin.reset': 'Restablecer',
    'admin.overrideNote': 'Nota: Estos cambios sobrescribirán la visualización automática de la fecha/hora en la página principal.',
    'admin.manualNumbers': 'Números manuales (opcional)',
    'admin.lastWinningNumbers': 'Últimos números ganadores',
    'admin.winnersByClass': 'Ganadores por categoría',
    'admin.overridesSavedSuccess': '¡Reemplazos de visualización guardados con éxito!',
    'admin.overridesSaveError': 'Error al guardar los reemplazos',
    'admin.jackpotControl': 'Control del bote',
    'admin.simulatedJackpot': 'Bote simulado',
    'admin.adminControlled': 'Controlado por el administrador',
    'admin.realJackpot': 'Bote real',
    'admin.percentRevenue': '40% de los ingresos',
    'admin.displayedJackpot': 'Bote mostrado',
    'admin.editJackpot': 'Editar bote',
    'admin.editJackpotAmount': 'Editar cantidad del bote',
    'admin.newJackpotAmount': 'Nueva cantidad del bote (€)',
    'admin.confirm': 'Confirmar',
    'admin.cancel': 'Cancelar',
    'admin.drawingControl': 'Control de sorteo',
    'admin.noDrawingPerformed': 'No se realizó el sorteo',
    'admin.drawingPending': 'Sorteo pendiente',
    'admin.ready': 'Listo',
    'admin.startDrawing': 'Iniciar sorteo',
    'admin.drawingInProgress': 'Sorteo en progreso...',
    'admin.autoDrawing': 'Sorteo automático',
    'admin.automaticDrawing': 'Sorteo automático',
    'admin.nextDrawing': 'Próximo sorteo',
    'admin.timeUntilDrawing': 'Tiempo hasta el sorteo:',
    'admin.recentTickets': 'Boletos recientes',
    'admin.total': 'total',
    'admin.autoDrawingToggleSuccess': '¡Sorteo automático {status}!',
    'admin.autoDrawingToggleError': 'Error al cambiar el sorteo automático',
    'form.submitError': 'Error al enviar boletos de lotería',
    'form.ticketNumber': 'Boleto de lotería {number}',
    'form.twoWorldNumbers': '2 de 12 números mundiales',
    'form.ticketComplete': 'Boleto completo',
    'form.addAnother': 'Agregar otro boleto',
    'format.timeAt': 'a las {time}',
    'admin.user': 'Usuario:',
    'admin.winnerClass': 'Clase ganadora'
  },
  it: {
    'admin.reset': 'Ripristina',
    'admin.overrideNote': 'Nota: Queste modifiche sovrascriveranno la visualizzazione automatica di data/ora nella pagina principale.',
    'admin.manualNumbers': 'Numeri manuali (opzionale)',
    'admin.lastWinningNumbers': 'Ultimi numeri vincenti',
    'admin.winnersByClass': 'Vincitori per categoria',
    'admin.overridesSavedSuccess': 'Sostituzioni di visualizzazione salvate con successo!',
    'admin.overridesSaveError': 'Errore nel salvataggio delle sostituzioni',
    'admin.jackpotControl': 'Controllo jackpot',
    'admin.simulatedJackpot': 'Jackpot simulato',
    'admin.adminControlled': 'Controllato dall\'amministratore',
    'admin.realJackpot': 'Jackpot reale',
    'admin.percentRevenue': '40% delle entrate',
    'admin.displayedJackpot': 'Jackpot visualizzato',
    'admin.editJackpot': 'Modifica jackpot',
    'admin.editJackpotAmount': 'Modifica importo jackpot',
    'admin.newJackpotAmount': 'Nuovo importo jackpot (€)',
    'admin.confirm': 'Conferma',
    'admin.cancel': 'Annulla',
    'admin.drawingControl': 'Controllo estrazione',
    'admin.noDrawingPerformed': 'Nessuna estrazione effettuata',
    'admin.drawingPending': 'Estrazione in sospeso',
    'admin.ready': 'Pronto',
    'admin.startDrawing': 'Avvia estrazione',
    'admin.drawingInProgress': 'Estrazione in corso...',
    'admin.autoDrawing': 'Estrazione automatica',
    'admin.automaticDrawing': 'Estrazione automatica',
    'admin.nextDrawing': 'Prossima estrazione',
    'admin.timeUntilDrawing': 'Tempo fino all\'estrazione:',
    'admin.recentTickets': 'Biglietti recenti',
    'admin.total': 'totale',
    'admin.autoDrawingToggleSuccess': 'Estrazione automatica {status}!',
    'admin.autoDrawingToggleError': 'Errore nel cambio dell\'estrazione automatica',
    'form.submitError': 'Errore nell\'invio dei biglietti della lotteria',
    'form.ticketNumber': 'Biglietto della lotteria {number}',
    'form.twoWorldNumbers': '2 su 12 numeri mondiali',
    'form.ticketComplete': 'Biglietto completo',
    'form.addAnother': 'Aggiungi un altro biglietto',
    'format.timeAt': 'alle {time}',
    'admin.user': 'Utente:',
    'admin.winnerClass': 'Classe vincente'
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
