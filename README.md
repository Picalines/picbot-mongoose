Обработчик базы данных на [mongoose](https://www.npmjs.com/package/mongoose) для [picbot-engine](https://github.com/Picalines/picbot-engine)

Пример главного файла, в котором нужно подключать обработчик:

```js
import { Client } from 'discord.js';
import { Bot } from 'picbot-engine';

import { mongooseDatabaseHandler } from 'picbot-mongoose';

const client = new Client();

const bot = new Bot(client, {
    // ...

    databaseHandler: mongooseDatabaseHandler({
        databaseUrl: 'YOUR_DATABASE_URL',
        connectOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    }),
});

bot.load();
```

Замените `YOUR_DATABASE_URL` на ссылку до вашей базы данных

Объект `connectOptions` передаётся в `mongoose.connect`

Редактировать код команд не нужно, т.к. там все взаимодействия с базой данных спрятаны за интерфейсом `picbot-engine`. Какие-то проблемы могут возникнуть только с кастомными типами свойст (`State.accessFabric`), однако это зависит уже только от вас.
