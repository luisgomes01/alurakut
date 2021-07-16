import { SiteClient } from 'datocms-client';


export default async function recebedorDeRequests(request, response) {
    
    if(request.method === 'POST') {
        const TOKEN = '3554f80248fa73c8095fa85b2e3c72 '
        const client = new SiteClient(TOKEN);
    

        const registroCriado = await client.items.create({
            itemType: "967332", 
            ...request.body,
            //title: "Comunidade de Teste",
          //  imgUrl: "http://github.com/luisxx123.png",
           // creatorSlug: "luisxx123"
        })
    
        console.log(registroCriado);
    
        response.json({
            dados: 'Algum dado qualquer',
            registroCriado: registroCriado,
        })
    }   
}