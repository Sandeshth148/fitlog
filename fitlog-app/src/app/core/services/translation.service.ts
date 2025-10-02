import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<string>('en');
  private translations: { [key: string]: Translation } = {};

  readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  constructor() {
    this.loadTranslations();
    this.loadSavedLanguage();
  }

  get currentLanguage() {
    return this.currentLanguage$.asObservable();
  }

  getCurrentLanguageCode(): string {
    return this.currentLanguage$.value;
  }

  setLanguage(languageCode: string) {
    if (this.supportedLanguages.find(lang => lang.code === languageCode)) {
      this.currentLanguage$.next(languageCode);
      localStorage.setItem('fitlog-language', languageCode);
    }
  }

  translate(key: string): string {
    const currentLang = this.currentLanguage$.value;
    const translation = this.getNestedTranslation(this.translations[currentLang], key);
    return translation || key;
  }

  private getNestedTranslation(obj: Translation, key: string): string {
    const keys = key.split('.');
    let result: any = obj;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return '';
      }
    }
    
    return typeof result === 'string' ? result : '';
  }

  private loadSavedLanguage() {
    const savedLanguage = localStorage.getItem('fitlog-language');
    if (savedLanguage && this.supportedLanguages.find(lang => lang.code === savedLanguage)) {
      this.currentLanguage$.next(savedLanguage);
    }
  }

  private loadTranslations() {
    this.translations = {
      en: {
        nav: {
          home: 'Home',
          trends: 'Trends'
        },
        home: {
          title: 'Weight Tracker',
          addEntry: 'Add Entry',
          noEntries: 'No weight entries yet',
          getStarted: 'Add your first weight entry to get started!'
        },
        trends: {
          title: 'Health Trends',
          subtitle: 'Track your progress and visualize your fitness journey over time.',
          weightTrend: 'Weight Trend',
          bmiTrend: 'BMI Trend',
          noData: 'No data available for the selected time range.',
          addEntries: 'Add some weight entries to see your trend!'
        },
        stats: {
          average: 'Average',
          current: 'Current',
          gained: 'Gained',
          lost: 'Lost',
          increased: 'Increased',
          decreased: 'Decreased',
          idealRange: 'Ideal Range',
          status: 'Status',
          averageBmi: 'Average BMI',
          currentBmi: 'Current BMI'
        },
        bmi: {
          underweight: 'Underweight',
          normal: 'Normal',
          overweight: 'Overweight',
          obese: 'Obese'
        },
        form: {
          date: 'Date',
          weight: 'Weight',
          notes: 'Notes',
          height: 'Height',
          save: 'Save',
          cancel: 'Cancel',
          edit: 'Edit',
          delete: 'Delete'
        },
        footer: {
          copyright: '© {{year}} FitLog. All rights reserved.',
          tagline: 'Track your fitness journey, one entry at a time.'
        },
        pwa: {
          installTitle: 'Install FitLog',
          installSubtitle: 'Get the full app experience',
          installButton: 'Install App'
        }
      },
      es: {
        nav: {
          home: 'Inicio',
          trends: 'Tendencias'
        },
        home: {
          title: 'Seguimiento de Peso',
          addEntry: 'Agregar Entrada',
          noEntries: 'Aún no hay entradas de peso',
          getStarted: '¡Agrega tu primera entrada de peso para comenzar!'
        },
        trends: {
          title: 'Tendencias de Salud',
          subtitle: 'Rastrea tu progreso y visualiza tu viaje de fitness a lo largo del tiempo.',
          weightTrend: 'Tendencia de Peso',
          bmiTrend: 'Tendencia de IMC',
          noData: 'No hay datos disponibles para el rango de tiempo seleccionado.',
          addEntries: '¡Agrega algunas entradas de peso para ver tu tendencia!'
        },
        stats: {
          average: 'Promedio',
          current: 'Actual',
          gained: 'Ganado',
          lost: 'Perdido',
          increased: 'Aumentado',
          decreased: 'Disminuido',
          idealRange: 'Rango Ideal',
          status: 'Estado',
          averageBmi: 'IMC Promedio',
          currentBmi: 'IMC Actual'
        },
        bmi: {
          underweight: 'Bajo peso',
          normal: 'Normal',
          overweight: 'Sobrepeso',
          obese: 'Obeso'
        },
        form: {
          date: 'Fecha',
          weight: 'Peso',
          notes: 'Notas',
          height: 'Altura',
          save: 'Guardar',
          cancel: 'Cancelar',
          edit: 'Editar',
          delete: 'Eliminar'
        },
        footer: {
          copyright: '© {{year}} FitLog. Todos los derechos reservados.',
          tagline: 'Rastrea tu viaje de fitness, una entrada a la vez.'
        },
        pwa: {
          installTitle: 'Instalar FitLog',
          installSubtitle: 'Obtén la experiencia completa de la aplicación',
          installButton: 'Instalar App'
        }
      },
      hi: {
        nav: {
          home: 'होम',
          trends: 'रुझान'
        },
        home: {
          title: 'वजन ट्रैकर',
          addEntry: 'एंट्री जोड़ें',
          noEntries: 'अभी तक कोई वजन एंट्री नहीं',
          getStarted: 'शुरू करने के लिए अपनी पहली वजन एंट्री जोड़ें!'
        },
        trends: {
          title: 'स्वास्थ्य रुझान',
          subtitle: 'अपनी प्रगति को ट्रैक करें और समय के साथ अपनी फिटनेस यात्रा को देखें।',
          weightTrend: 'वजन रुझान',
          bmiTrend: 'बीएमआई रुझान',
          noData: 'चयनित समय सीमा के लिए कोई डेटा उपलब्ध नहीं।',
          addEntries: 'अपना रुझान देखने के लिए कुछ वजन एंट्री जोड़ें!'
        },
        stats: {
          average: 'औसत',
          current: 'वर्तमान',
          gained: 'बढ़ा',
          lost: 'घटा',
          increased: 'बढ़ा',
          decreased: 'घटा',
          idealRange: 'आदर्श सीमा',
          status: 'स्थिति',
          averageBmi: 'औसत बीएमआई',
          currentBmi: 'वर्तमान बीएमआई'
        },
        bmi: {
          underweight: 'कम वजन',
          normal: 'सामान्य',
          overweight: 'अधिक वजन',
          obese: 'मोटापा'
        },
        form: {
          date: 'तारीख',
          weight: 'वजन',
          notes: 'नोट्स',
          height: 'ऊंचाई',
          save: 'सेव करें',
          cancel: 'रद्द करें',
          edit: 'संपादित करें',
          delete: 'हटाएं'
        },
        footer: {
          copyright: '© {{year}} FitLog. सभी अधिकार सुरक्षित।',
          tagline: 'अपनी फिटनेस यात्रा को ट्रैक करें, एक बार में एक एंट्री।'
        },
        pwa: {
          installTitle: 'FitLog इंस्टॉल करें',
          installSubtitle: 'पूरा ऐप अनुभव प्राप्त करें',
          installButton: 'ऐप इंस्टॉल करें'
        }
      }
    };
  }
}
