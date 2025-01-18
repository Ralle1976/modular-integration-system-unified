import { QueryBuilder } from '../modules/mysql/query/QueryBuilder';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

interface OrderStats {
  user_id: number;
  total_orders: number;
  total_amount: number;
}

async function complexQueryExample() {
  const query = new QueryBuilder();

  // Komplexe Abfrage mit Joins, Bedingungen und Gruppierung
  const result = await query
    .select([
      'users.id',
      'users.username',
      'COUNT(orders.id) as total_orders',
      'SUM(orders.amount) as total_amount'
    ])
    .from('users')
    .leftJoin('orders', 'orders.user_id = users.id')
    .where('users.status', '=', 'active')
    .whereIn('users.role', ['customer', 'vip'])
    .groupBy(['users.id', 'users.username'])
    .having('total_orders', '>', 5)
    .orderBy('total_amount', 'DESC')
    .paginate({ page: 1, perPage: 20 })
    .getPaginated<OrderStats>();

  console.log(result);
}

async function multipleJoinsExample() {
  const query = new QueryBuilder();

  // Mehrfache Joins mit komplexen Bedingungen
  const users = await query
    .select([
      'users.*',
      'profiles.avatar',
      'COUNT(orders.id) as order_count'
    ])
    .from('users')
    .leftJoin('profiles', 'profiles.user_id = users.id')
    .leftJoin('orders', 'orders.user_id = users.id')
    .where('users.active', '=', true)
    .whereBetween('users.created_at', ['2024-01-01', '2024-12-31'])
    .groupBy(['users.id', 'profiles.avatar'])
    .having('order_count', '>', 0)
    .orderBy('order_count', 'DESC')
    .get<User>();

  console.log(users);
}

async function main() {
  try {
    await complexQueryExample();
    await multipleJoinsExample();
  } catch (error) {
    console.error('Error in examples:', error);
  }
}

main();
