import { FactNumber } from '../components/FactNumber';
import { usePreferences } from '../preferences/PreferencesProvider';
import { ExternalLink } from '../components/ExternalLink';

const facts = [
  {value: 1176960, year: 2025, es: 'Habitantes del municipio', en: 'Residents within the city boundary', source: 'ONS · Nomis', url: 'https://www.nomisweb.co.uk/reports/lmp/lad/1778385147/report.aspx'},
  {value: 1889, year: 1889, es: 'Año de concesión del estatus de ciudad', en: 'Year city status was granted', source: 'Birmingham City Council', url: 'https://www.birmingham.gov.uk/download/downloads/id/3064/birminghams_transformation_and_future_prospects.pdf'},
  {value: 7, year: 2026, es: 'Municipios metropolitanos de la WMCA', en: 'Metropolitan boroughs in the WMCA area', source: 'West Midlands Combined Authority', url: 'https://www.wmca.org.uk/documents/policies/west-midlands-state-of-the-region-reports/west-midlands-state-of-the-region-report-2026-executive-summary/'}
];

export function AboutBirmingham() {
  const { lang } = usePreferences();
  const es = lang === 'es';
  return <section className="section" aria-labelledby="about-birmingham">
    <h2 id="about-birmingham" className="title-2">{es ? 'Sobre Birmingham' : 'About Birmingham'}</h2>
    <p className="lead">{es ? 'Antes de los talleres y los canales hubo un asentamiento sajón junto al río Rea. El mercado autorizado en 1166 atrajo a comerciantes; los oficios del metal dieron a la ciudad una clientela mucho más amplia.' : 'Before the workshops and canals there was a Saxon settlement by the River Rea. A market charter in 1166 drew traders, and metalworkers went on to find customers far beyond the town.'} <ExternalLink href="https://www.birmingham.gov.uk/info/50050/culture_arts_and_heritage/1258/">Birmingham City Council</ExternalLink></p>
    <p>{es ? 'El ayuntamiento describe Birmingham como la segunda ciudad del Reino Unido, después de Londres, y por tanto también de Inglaterra. La cifra de habitantes corresponde al municipio. El área de la autoridad metropolitana incluye además Coventry, Dudley, Sandwell, Solihull, Walsall y Wolverhampton.' : 'The council describes Birmingham as the second city by size in the UK, after London, placing it second in England too. The population figure below is for the city itself. The combined authority also covers Coventry, Dudley, Sandwell, Solihull, Walsall and Wolverhampton.'} <ExternalLink href="https://www.birmingham.gov.uk/download/downloads/id/25056/birmingham_local_plan_issues_and_options.pdf">Birmingham City Council</ExternalLink></p>
    <div className="brum-facts">{facts.map(fact => <div className="fact" key={fact.es}>
      <FactNumber label={fact.value.toLocaleString(lang, {useGrouping:fact.value !== 1889})} /><p>{fact[lang]}</p>
      <ExternalLink href={fact.url}>{fact.source} · {fact.year}</ExternalLink>
    </div>)}</div>
    <p>{es ? 'Para seguir el hilo de esa historia, recorre los canales y busca los escaparates del Jewellery Quarter: detrás de las joyas hay un barrio que sigue dedicado al oficio.' : 'Follow that story along the canals and into the Jewellery Quarter. Behind the shop windows is a neighbourhood where making jewellery is still a working trade.'} <ExternalLink href="https://visitbirmingham.com/inspire-me/areas/the-jewellery-quarter/">Visit Birmingham</ExternalLink></p>
    <p className="note">{es ? 'Fuentes consultadas el 22 de noviembre de 2026.' : 'Sources checked on 22 November 2026.'}</p>
  </section>;
}
