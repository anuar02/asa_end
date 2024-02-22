const { Client } = require('pg');

// Задайте конфигурацию подключения
const connectionConfig = {
    user: 'asa_admin',
    host: 'https://asaprojectserver.database.windows.net',
    database: 'asa_db',
    password: 'postgres_1',
    port: '5432', // обычно 5432
    ssl: {
        rejectUnauthorized: false, // если используется SSL
    },
};

// Создайте нового клиента
const client = new Client(connectionConfig);

// Подключитесь к базе данных
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch((error) => console.error('Error connecting to PostgreSQL database:', error));

// Выполните SQL-запрос
client.query('SELECT * FROM your_table;')
    .then((result) => console.log('Query result:', result.rows))
    .catch((error) => console.error('Error executing SQL query:', error));

// Закройте соединение после выполнения запросов
client.end();
