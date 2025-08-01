//this file is used by jest to intercept import calls to nats-wrapper and import a fake nats wrapper instead
export const natsWrapper = {
    client: {
        //this is what we care about, fake impementation of the publish function
        publish: jest.fn().mockImplementation((subject: string, data: any, callback: () => void) => {
            callback();
        }),
    },
}