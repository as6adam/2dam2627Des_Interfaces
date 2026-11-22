import { usePreferences } from '../preferences/PreferencesProvider';
import { ExternalLink } from '../components/ExternalLink';
import { useDocumentTitle } from '../components/useDocumentTitle';
import { formatDate } from '../i18n';

const contacts: Array<{ es: string; en: string; number: string; source: string; checkedOn: string; emergency?: boolean }> = [
  {
    "es": "Emergencias · Policía, bomberos o ambulancia",
    "en": "Emergency · Police, fire or ambulance",
    "number": "999",
    "emergency": true,
    "source": "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Emergencias · Número alternativo",
    "en": "Emergency · Alternative number",
    "number": "112",
    "emergency": true,
    "source": "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "NHS · Ayuda médica urgente",
    "en": "NHS · Urgent medical help",
    "number": "111",
    "source": "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "West Midlands Police · Consultas no urgentes",
    "en": "West Midlands Police · Non-emergency enquiries",
    "number": "101",
    "source": "https://www.westmidlands.police.uk/contact/af/contact-us-beta/contact-us/?from=2469",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Birmingham Airport · Reservas de aparcamiento",
    "en": "Birmingham Airport · Car park bookings",
    "number": "0345 050 7080",
    "source": "https://www.birminghamairport.co.uk/contact-and-feedback/",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Birmingham Airport · Objetos perdidos en la terminal",
    "en": "Birmingham Airport · Terminal lost property",
    "number": "0330 223 0893",
    "source": "https://www.birminghamairport.co.uk/at-the-airport/airport-facilities/lost-property/",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Birmingham Airport · Equipaje perdido, retrasado o dañado (Swissport)",
    "en": "Birmingham Airport · Missing, delayed or damaged baggage (Swissport)",
    "number": "+44 121 368 3995",
    "source": "https://www.birminghamairport.co.uk/contact-and-feedback/",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Transport for West Midlands · Atención al viajero",
    "en": "Transport for West Midlands · Travel enquiries",
    "number": "0345 303 6760",
    "source": "https://www.tfwm.org.uk/get-help/contact-us/?nostats=t&text=large",
    "checkedOn": "2026-11-22"
  },
  {
    "es": "Birmingham City Council · Centralita",
    "en": "Birmingham City Council · Switchboard",
    "number": "0121 303 1111",
    "source": "https://www.birmingham.gov.uk/info/20208/contact_us/229/useful_telephone_numbers",
    "checkedOn": "2026-11-22"
  }
];

export function UsefulNumbers() {
  const { t, lang } = usePreferences();
  useDocumentTitle(t.shell.numbers);
  const emergencyLabel = lang === 'es' ? 'Emergencia: riesgo para la vida' : 'Emergency: risk to life';
  return <article className="section">
    <h1 className="title-1" tabIndex={-1}>{t.shell.numbers}</h1>
    <ul className="brum-facts" role="list">{contacts.map(contact => <li key={contact.number} className="fact" data-emergency={contact.emergency || undefined}>
      {contact.emergency && <p className="brum-tel__flag">{emergencyLabel}</p>}
      <h2 className="title-3">{contact[lang]}</h2>
      <a className="brum-tel" href={'tel:' + contact.number.replaceAll(' ', '')}>{contact.number}</a>
      <p className="note"><ExternalLink href={contact.source}>{new URL(contact.source).hostname}</ExternalLink> · {formatDate(contact.checkedOn, lang)}</p>
    </li>)}</ul>
  </article>;
}
