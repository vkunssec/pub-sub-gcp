/**
 * testes gcp pubsub
 * 
 * instalacao gcloud cli
 * https://cloud.google.com/sdk/docs/install?hl=pt-br
 * 
 * emulador do pub sub pra desenvolvimento local
 * https://wahlstrand.dev/articles/2021-07-11-testing-pubsub-locally/
 * 
 * > gcloud beta emulators pubsub start --project=test-project
 * 
 * nao esquecer de validar o HOST do pub/sub emulator 
 * > $(gcloud beta emulators pubsub env-init)
 * sera criado o environment PUBSUB_EMULATOR_HOST: 'localhost:8085'
 * > process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'
 * 
 * rodando com docker 
 * https://github.com/3AP-AG/pubsub-emulator-docker
 * 
 * 
 * ambiente de desenvolvimento para k8s gke - nao precisa desse por enquanto
 * https://cloud.google.com/community/tutorials/developing-services-with-k8s
 */


// import { inspect } from 'util';
// import { PubSub } from '@google-cloud/pubsub';

async function deleteSubscription(client: any) {
    await client.subscription("subscription-name").delete();
    console.log(`Subscription ${"subscription-name"} deleted.`);
}

async function deleteTopic(client: any) {
    await client.topic("topic-name").delete();
    console.log(`Topic ${"topic-name"} deleted.`);
}

// // Instantiate a client
// process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'
// const client = new PubSub({ projectId: "test-project" });

// const [ topics ] = await client.getTopics();
// // console.log(topics);

// let topic;
// try {
//     // Create new Topic
//     const created = await client.createTopic("topic-name");
//     topic = created.topic;
// } catch (error) {
//     if (error.code === 6) { // topic already exists
//         topic = await client.topic("topic-name");
//     }
// }
// // console.log(inspect(topic, false, 4));

// let subscription;
// try {
//     // Creates a subscription on that new topic
//     const created = await topic.createSubscription("subscription-name");
//     subscription = created.subscription;
// } catch (error) {
//     if (error.code === 6) { // topic already exists
//         subscription = await client.subscription("subscription-name");
//     }
// }
// // console.log(inspect(subscription, false, 4));

// // Receive callbacks for new messages on the subscription
// subscription.on('message', message => {
//     console.log('Received message:', message.data.toString());

//     deleteSubscription().catch(console.error);
//     deleteTopic().catch(console.error);
    
//     process.exit(0);
// });

// // Receive callbacks for errors on the subscription
// subscription.on('error', error => {
//     console.error('Received error:', error);


//     deleteSubscription().catch(console.error);
//     deleteTopic().catch(console.error);
    
//     process.exit(1);
// });

// try {
//     // Send a message to the topic
//     const data = Buffer.from(
//         JSON.stringify({
//             test: "simple json message"
//         })
//     );
//     const attributes = {
//         origin: "sample",
//         host: "gcp"
//     };
//     const dataBuffer = Buffer.from(data);

//     // Be sure to set an ordering key that matches other messages
//     // you want to receive in order, relative to each other.
//     const message = {
//         data: dataBuffer,
//         attributes,
//         orderingKey: "key1"
//     };
//     await topic.publishMessage(message);
// } catch (error) {
//     console.error(error);
// }

import { createSubscription, createTopic, getClient, handlerMessage, publishMessage, receiveMessage } from "./helpers";

(async() => {
    const client = await getClient({
        projectId: 'vknc-253703'
    });

    // try {
    //     await deleteSubscription(client);
    //     await deleteTopic(client);
    // } catch (error) {}

    const topic = await createTopic({
        client,
        topicName: "topic-name",
    });
    // console.log(topic);
    const subscription = await createSubscription({
        client,
        topic: topic,
        subscriptionName: "subscription-name",
        filterString: 'attributes.test="event.message.string"',
    });
    // console.log(subscription);
    const m1 = await publishMessage({
        topic,
        payload: {
            message: 'test with filter',
        },
        options: {
            attributes: {
                'test': 'event.message.string'
            }
        }
    });
    console.log("Mensagens enviadas");
    console.log(m1);
    const m2 = await publishMessage({
        topic,
        payload: {
            message: 'test without filter',
        },
    });
    console.log(m2);
    
    console.log("Mensagens recebidas");
    // para cada metodo inscrito no topico, definir um handler
    await receiveMessage({ subscription, handler: handlerMessage });

    // const [ subscriptions ] = await client.getSubscriptions();
    // console.log(subscriptions[0].metadata);
})();
