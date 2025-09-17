const express = require("express");
const cors = require("cors");
const { kv } = require("@vercel/kv"); // Cliente do Vercel KV
const Pusher = require("pusher"); // Cliente do Pusher

const app = express();

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
    const pedidos = await kv.lrange("pedidos", 0, -1); // Pega todos os itens da lista 'pedidos'
    const entregues = await kv.lrange("entregues", 0, -1);
    res.json({ pedidos, entregues });
  } catch (error) {
    res.status(500).json({ error: "Falha ao buscar dados." });
  }
});

// WEBHOOK CONTINUA IGUAL, MAS A LÓGICA DE DADOS MUDA
app.post("/api/webhook/pedido", async (req, res) => {
  const { cliente, pedido, entrega, tipo } = req.body;

  if (tipo === "pedido_entregue") {
    // Lógica para mover de 'pedidos' para 'entregues' no Vercel KV
    const todosOsPedidos = await kv.lrange("pedidos", 0, -1);
    const pedidoParaMover = todosOsPedidos.find(p => p.cliente.toLowerCase().includes(cliente.toLowerCase()));

    if (pedidoParaMover) {
      pedidoParaMover.dataEntrega = new Date().toISOString();
      await kv.lrem("pedidos", 0, pedidoParaMover); // Remove da lista de pendentes
      await kv.lpush("entregues", pedidoParaMover); // Adiciona na lista de entregues
    }
  } else {
    // Adiciona um novo pedido na lista 'pedidos'
    const novoPedido = {
      id: Date.now(),
      cliente,
      pedido,
      entrega,
      timestamp: new Date().toISOString(),
    };
    await kv.rpush("pedidos", novoPedido); // Adiciona no final da lista
  }

  // Pega os dados atualizados do banco
  const pedidos = await kv.lrange("pedidos", 0, -1);
  const entregues = await kv.lrange("entregues", 0, -1);

  // Notificar frontend via Pusher
  await pusher.trigger("pedidos-channel", "pedido_update", {
    pedidos,
    entregues,
  });

  res.json({ success: true });
});

// Remova o server.listen e exporte o app para a Vercel
module.exports = app;