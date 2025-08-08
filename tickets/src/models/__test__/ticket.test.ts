import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });
  // save the ticket to the database
  await ticket.save();
  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //make a change to each ticket we made
  firstInstance!.set({ price: 30 });
  secondInstance!.set({ price: 40 });
  //save the first fetched ticket
  await firstInstance!.save();
  //save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error(
    'Should not reach this point, optimistic concurrency control failed'
  );
});

it('increments the version number on multiple saves', async () => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  }); 
  await ticket.save();
  expect(ticket.version).toEqual(0);

  // save the ticket to the database again => version should increment
  await ticket.save();
  expect(ticket.version).toEqual(1);
  // save the ticket to the database again => version should increment
  await ticket.save();
  expect(ticket.version).toEqual(2);
})