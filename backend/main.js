const express = require("express");
const cors = require("cors");
const Pusher = require("pusher"); // Cliente do Pusher
const Redis = require("ioredis"); // 1. Importa a biblioteca ioredis

const app = express();

// 2. Configuração do Cliente Redis
// O ioredis vai automaticamente usar a variável de ambiente REDIS_URL que a Vercel fornece
const redis = new Redis(process.env.REDIS_URL);

// Configuração do Pusher (pegue as credenciais no seu dashboard do Pusher)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

app.use(cors());
app.use(express.json());

// ROTA PARA O FRONTEND PEGAR OS DADOS INICIAIS
app.get("/api/pedidos", async (req, res) => {
  try {
    // Pega as strings do Redis
    const pedidosStrings = await redis.lrange("pedidos", 0, -1);
    const entreguesStrings = await redis.lrange("entregues", 0, -1);

    // 3. Converte as strings de volta para objetos JSON para enviar ao frontend
    const pedidos = pedidosStrings.map(JSON.parse);
    const entregues = entreguesStrings.map(JSON.parse);

    res.json({ pedidos, entregues });
  } catch (error) {
    console.error("Falha ao buscar dados no Redis:", error);
    res.status(500).json({ error: "Falha ao buscar dados." });
  }
});

// WEBHOOK ADAPTADO PARA IOREDIS
app.post("/api/webhook/pedido", async (req, res) => {
  const { cliente, pedido, entrega, tipo } = req.body;

  try {
    if (tipo === "pedido_entregue") {
      const pedidosStrings = await redis.lrange("pedidos", 0, -1);
      let todosOsPedidos = pedidosStrings.map(JSON.parse); // Converte para objetos para poder manipular

      const pedidoIndex = todosOsPedidos.findIndex(p =>
        p && p.cliente && p.cliente.toLowerCase().includes(cliente.toLowerCase())
      );

      if (pedidoIndex !== -1) {
        const [pedidoParaMover] = todosOsPedidos.splice(pedidoIndex, 1);
        pedidoParaMover.dataEntrega = new Date().toISOString();
        
        await redis.del("pedidos");
        if (todosOsPedidos.length > 0) {
          // 4. Converte os objetos de volta para strings antes de salvar
          const pedidosParaSalvar = todosOsPedidos.map(JSON.stringify);
          await redis.rpush("pedidos", ...pedidosParaSalvar);
        }
        
        // 4. Converte o objeto para string antes de salvar
        await redis.lpush("entregues", JSON.stringify(pedidoParaMover));
      }
    } else {
      const novoPedido = {
        id: Date.now(),
        cliente,
        pedido,
        entrega,
        timestamp: new Date().toISOString(),
      };
      // 4. Converte o objeto para string antes de salvar
      await redis.rpush("pedidos", JSON.stringify(novoPedido));
    }

    const pedidosStrings = await redis.lrange("pedidos", 0, -1);
    const entreguesStrings = await redis.lrange("entregues", 0, -1);
    const pedidos = pedidosStrings.map(JSON.parse);
    const entregues = entreguesStrings.map(JSON.parse);

    await pusher.trigger("pedidos-channel", "pedido_update", {
      pedidos,
      entregues,
    });

    res.json({ success: true });

  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ success: false, error: "Ocorreu um erro interno." });
  }
});

module.exports = app;