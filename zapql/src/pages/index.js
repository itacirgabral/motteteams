import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'WhatsApp',
    imageUrl: 'img/whatsapp.png',
    description: (
      <>
        Lider no segmento, WhatsApp é a principal forma de atendimento 
        para vários setores. Oferecemos uma API para comunicação
        robusta e resiliente.
      </>
    ),
  },
  {
    title: 'GraphQL',
    imageUrl: 'img/graphql.png',
    description: (
      <>
        Seja expressivo e preciso nas suas requisições, receba notificações
        em tempo real. Funciona tanto em navegadores quanto para servidores.
      </>
    ),
  },
  {
    title: 'Pilhas incluídas',
    imageUrl: 'img/battery.png',
    description: (
      <>
        Prototipe rápido, escale fácil. Você pode testar mesmo sem nenhum cadastro,
        disponha de componentes para alavancar seu desenvolvimento.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      description="WhatsApp over GraphL">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <img src="img/zapqlbarrabarra.jpg" />
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className={styles.plans}>
          <div className="container">
            <div className="row">
              <div className={styles.vspace}></div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;


/*
O plano pessoal é generoso
                  e o no empresarial você recebe componentes
                  e modelos para acelerar seu desenvolvimento.
*/