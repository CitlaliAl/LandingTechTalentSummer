/* Configuración de Tailwind (CDN): colores y sombras de la marca.
   Si se llega a desear cambiar la paleta del evento, hacerlo aquí. */
tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: {
                    navy: '#0f172a',
                    blue: '#0284c7',
                    cyan: '#06b6d4',
                    sky: '#e0f2fe',
                    orange: '#f97316',
                    coral: '#ff4500',
                    orangeLight: '#ffedd5',
                    bgLight: '#f8fafc',
                    cardBg: '#ffffff',
                    slateBorder: '#e2e8f0'
                }
            },
            boxShadow: {
                'soft-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
                'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.2)',
                'glow-orange': '0 0 20px rgba(249, 115, 22, 0.2)'
            }
        }
    }
};
