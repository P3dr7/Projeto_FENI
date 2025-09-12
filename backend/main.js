// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(cors());
app.use(express.json());

let pedidos = [];
let entregues = [];

// Webhook do N8N
app.post("/api/webhook/pedido", (req, res) => {
	const { cliente, pedido, entrega, tipo } = req.body;

	// console.log('Recebido webhook:', req.body);

	if (tipo === "pedido_entregue") {
		const pedidoIndex = pedidos.findIndex((p) =>
			p.cliente.toLowerCase().includes(cliente.toLowerCase())
		);

		if (pedidoIndex !== -1) {
			const pedidoEntregue = pedidos.splice(pedidoIndex, 1)[0];
			pedidoEntregue.dataEntrega = new Date().toISOString();
			entregues.unshift(pedidoEntregue);
		}
	} else {
		const novoPedido = {
			id: Date.now(),
			cliente,
			pedido,
			entrega,
			timestamp: new Date().toISOString(),
		};
		// console.log(novoPedido)
		pedidos.push(novoPedido);
	}

	// Notificar frontend via WebSocket
	// console.log("pedidos", pedidos);
	// console.log("entregues", entregues);

	io.emit("pedido_update", { pedidos, entregues });

	res.json({ success: true });
});

// Use server.listen para o socket.io funcionar
server.listen(3000, () => {
	console.log("Servidor rodando na porta 3000");
});
