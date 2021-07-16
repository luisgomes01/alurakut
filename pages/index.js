import Box from '../src/components/Box'
import MainGrid from '../src/components/MainGrid'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

import React from 'react'

function ProfileSidebar(propriedades) {
  return (
    <Box as="aside">
      <img src={`http://github.com/${propriedades.githubUser}.png`} style={{borderRadius: '8px'}} />
      <hr />
      <p>
        <a className="boxLink" href={`http://github.com/${propriedades.githubUser}`}>
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  );
}

function ProfileRelationsBox(propriedades){
  return (
      <ProfileRelationsBoxWrapper>
        <h2 className="smallTitle">
              {propriedades.title} ({propriedades.items.length})
        </h2>
        {/*<ul>
              {seguidores.map((itemAtual) => {
                return(
                  <li key={itemAtual}>
                    <a href={`https://github.com${itemAtual.title}`}>
                      <img src={itemAtual.image}/>
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>*/}
    </ProfileRelationsBoxWrapper>
  );
}

export default function Home(props) {
  const usuarioAleatorio = props.githubUser;
  const [comunidades, setComunidades] = React.useState([{
    
  }]);

//  const comunidades = ["Alurakut"];
  const pessoasFavoritas = [
    'juunegreiros',
    'omariosouto',
    'peas',
    'rafaballerini',
    'marcobrunodev',
    'felipefialho'
  ]

  // 1- Criar box pra  fazer map baseado nos itens do arrya
  const [seguidores, setSeguidores] = React.useState([]);
  React.useEffect(function(){
    fetch('https://api.github.com/users/luisxx123/followers')
    .then(function(respostaDoServidor){
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta){
      setSeguidores(respostaCompleta);
    })

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'c55a8a5b5c419062d681ef675beff8',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ "query": `query { 
        allCommunities { 
          title
          id
          imgUrl
          creatorSlug
        } 
      }` })
    })
    .then((response) => response.json())
    .then((respostaCompleta) => {
      const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
      console.log(comunidadesVindasDoDato)
      setComunidades(comunidadesVindasDoDato)
    })

  }, [])

  return (
    <>
      <AlurakutMenu githubUser={usuarioAleatorio}/>
      <MainGrid>     
      <div className="profileArea" style={{gridArea: 'profileArea'}}>
        <Box>
          <ProfileSidebar githubUser={usuarioAleatorio}/>
        </Box>
      </div>
      <div className="welcomeArea" style={{gridArea: 'welcomeArea'}}>
        <Box>
          <h1 className="title">
            Bem-vindo(a)
          </h1>
          <OrkutNostalgicIconSet/>
        </Box>
        <Box>
          <h2 className="subTitle">O que você deseja fazer?</h2>
          <form onSubmit={function handleCriaComunidade(e){
            e.preventDefault();
            const dadosDoForm = new FormData(e.target);
            
            console.log('Campo:', dadosDoForm.get('title'));
            console.log('Campo:', dadosDoForm.get('image'));

            const comunidade = {
              title: dadosDoForm.get('title'),
              imgUrl: dadosDoForm.get('image'),
              creatorSlug: usuarioAleatorio,
            }

            fetch('/api/comunidades', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(comunidade)
            })

            .then(async(response) => {
              const dados = await response.json();
              console.log(dados.registroCriado);
              const comunidade = dados.registroCriado;
              const comunidadesAtualizadas = [...comunidades, comunidade];
              setComunidades(comunidadesAtualizadas);
            })

            
            
          }}>
            <div>
              <input
              name="title" 
              arial-label="Qual vai ser o nome da sua comunidade?" 
              placeholder="Qual vai ser o nome da sua comunidade?" 
              type="text"
              />
            </div>
            <div>
              <input
              name="image" 
              arial-label="Qual vai ser o nome da sua comunidade?" 
              placeholder="Coloque uma URL para usarmos de capa" 
              />
            </div>

            <button>
              Criar comunidade
            </button>
          </form>
        </Box>
      </div>
      <div className="profileRelationsArea" style={{gridArea: 'profileRelationsArea'}}>
        <ProfileRelationsBox title="Seguidores" items={seguidores} />
        <ProfileRelationsBoxWrapper>
          <h2 className="smallTitle">
                Comunidades ({comunidades.length})
          </h2>
          <ul>
                {comunidades.map((itemAtual) => {
                  return(
                    <li key={itemAtual.id}>
                      <a href={`/comunidades/${itemAtual.id}`}>
                        <img src={itemAtual.imgUrl}/>
                        <span>{itemAtual.title}</span>
                      </a>
                    </li>
                  )
                })}
          </ul>
        </ProfileRelationsBoxWrapper>
        
        <ProfileRelationsBoxWrapper>
          <h2 className="smallTitle">
            Pessoas da Comunidade ({pessoasFavoritas.length})
          </h2>

          <ul>
            {pessoasFavoritas.map((itemAtual) => {
              return(
                <li key={itemAtual}>
                  <a href={`/users/${itemAtual}`}>
                    <img src={`https://github.com/${itemAtual}.png`}/>
                    <span>{itemAtual}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </ProfileRelationsBoxWrapper>
          
      </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
        Authorization: token
      }
  })
  .then((resposta) => resposta.json())

  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }, 
  }
}