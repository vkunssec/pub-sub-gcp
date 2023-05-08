import { Message, PubSub, Subscription, Topic } from "@google-cloud/pubsub";
import { MessageOptions } from "@google-cloud/pubsub/build/src/topic";

const metadata = {
    deadLetterPolicy: {
      deadLetterTopic: undefined,
      maxDeliveryAttempts: 15,
    },
};
// .subscription().setMetadata(metadata)

/**
 * Função para Instanciar um Tópico a partir do nome
 * 
 * @param {PubSub} [client] Declaração da Instancia do PubSub
 * @param {string} [topicName] Nome do Tópico que se deseja
 * @returns {Promise<Topic>} Retorna a Instância do Tópico
 */
export async function getTopic({
    client,
    topicName,
}: {
    client: PubSub,
    topicName: string,
}): Promise<Topic> {
    return await client.topic(topicName);
}

/** */
export async function createTopic({
    client,
    topicName,
}: {
    client: PubSub,
    topicName: string,
}): Promise<Topic> {

    try {
        await client.createTopic(topicName);
    } catch (error: any) {
        if (error.code !== 6) {
            throw error;
        }        
    }

    return await getTopic({ client, topicName });
}

export async function getSubscription({
    client,
    subscriptionName,
}: {
    client: PubSub,
    subscriptionName: string,
}): Promise<Subscription> {
    return await client.subscription(subscriptionName);
}

/** */
export async function createSubscription({
    client,
    topic,
    subscriptionName,
    filterString,
}: {
    client: PubSub,
    topic: Topic,
    subscriptionName: string,
    filterString?: string,
}): Promise<Subscription> {

    const options = filterString ? { filter: filterString } : undefined;

    try {
        await topic.createSubscription(subscriptionName, options);
    } catch (error: any) {
        if (error.code !== 6) {
            throw error;
        }        
    }

    return await getSubscription({
        client,
        subscriptionName,
    });
}

export async function publishMessage({
    topic,
    payload,
    options
}: {
    topic: Topic,
    payload: string | object,
    options?: {
        attributes: { [ k: string ]: string } | null,
    },
}) {
    const data = Buffer.from(
        JSON.stringify(payload),
    );

    const message: MessageOptions = {
        data,
        ...options,
    };

    const messageId = await topic.publishMessage(message);

    return {
        messageId,
        payload,
        ...options,
    };
}

export async function handlerMessage(message: Message) {
    console.log({
        'id': message.id,
        'data': JSON.parse(message.data.toString()),
        'attributes': message.attributes,
    });

    // do something...

    message.ack();
    return message;
}

export async function receiveMessage({
    subscription,
    handler
}: { 
    subscription: Subscription,
    handler: (...args: any) => {},
}) {
    subscription.on('message', handler);
}

export async function getClient({ projectId }: { projectId?: string }) {
    return new PubSub({ projectId });
}
