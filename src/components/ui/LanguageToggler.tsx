import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ReactCountryFlag from 'react-country-flag';

export const LanguageToggler = () => {
    const router = useRouter();
    const { i18n } = useTranslation('common');

    const changeLanguage = (locale: string) => {
        router.push(router.pathname, router.asPath, { locale });
    };

    return (
        <div className="flex items-center space-x-1 bg-primary/10 rounded-full p-1 text-secondary transition-all">
            <button
                onClick={() => changeLanguage('nl')}
                className={`flex items-center space-x-1 rounded-full px-2 py-1 ${i18n.language === 'nl' ? 'bg-white shadow' : ''}`}
            >
                <ReactCountryFlag countryCode="NL" svg style={{ width: '1em', height: '1em' }} />
                <span className="font-medium text-xs xs:text-sm">NL</span>
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`flex items-center space-x-1 rounded-full px-2 py-1 ${i18n.language === 'en' ? 'bg-white shadow' : ''}`}
            >
                <ReactCountryFlag countryCode="GB" svg style={{ width: '1em', height: '1em' }} />
                <span className="font-medium text-xs xs:text-sm">EN</span>
            </button>
        </div>
    );
};