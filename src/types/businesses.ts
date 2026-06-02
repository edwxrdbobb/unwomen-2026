export interface Category {
    id: string;
    name: string;
  }
  
  export const BUSINESS_CATEGORIES: Category[] = [
    { id: 'SME', name: 'Small and Medium-Sized Enterprise' },
    { id: 'MACRO', name: 'Macro' },
    { id: 'MICRO', name: 'Micro' },
    { id: 'SOHO', name: 'Small Office/home Office' }
  ];
  
  