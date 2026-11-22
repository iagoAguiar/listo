// Gera os ícones PNG do PWA (192 e 512) sem dependência externa.
const fs = require("node:fs");
const zlib = require("node:zlib");
const path = require("node:path");

const TEAL = [15, 118, 110];
const CLARO = [240, 253, 250];

function desenhar(tamanho) {
  const px = Buffer.alloc(tamanho * tamanho * 4);
  const raio = Math.round(tamanho * 0.22);
  const dentroCanto = (x, y, x0, y0, x1, y1, r) => {
    if (x >= x0 + r && x <= x1 - r) return true;
    if (y >= y0 + r && y <= y1 - r) return true;
    const cx = x < x0 + r ? x0 + r : x1 - r;
    const cy = y < y0 + r ? y0 + r : y1 - r;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  // cartão de compras: retângulo claro com três linhas
  const margem = Math.round(tamanho * 0.28);
  const topo = Math.round(tamanho * 0.24);
  const base = Math.round(tamanho * 0.76);
  const raioCartao = Math.round(tamanho * 0.05);

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const i = (y * tamanho + x) * 4;
      const fundo = dentroCanto(x, y, 0, 0, tamanho - 1, tamanho - 1, raio);
      let cor = fundo ? TEAL : [0, 0, 0];
      let alfa = fundo ? 255 : 0;

      if (fundo && dentroCanto(x, y, margem, topo, tamanho - margem, base, raioCartao)) {
        cor = CLARO;
        const linhaAltura = Math.max(2, Math.round(tamanho * 0.055));
        const vao = Math.round(tamanho * 0.045);
        const esquerda = margem + Math.round(tamanho * 0.07);
        const direita = tamanho - margem - Math.round(tamanho * 0.07);
        for (let n = 0; n < 3; n++) {
          const yLinha = topo + Math.round(tamanho * 0.1) + n * (linhaAltura + vao);
          if (y >= yLinha && y < yLinha + linhaAltura) {
            const fim = n === 2 ? esquerda + Math.round((direita - esquerda) * 0.55) : direita;
            if (x >= esquerda && x < fim) cor = TEAL;
          }
        }
      }

      px[i] = cor[0];
      px[i + 1] = cor[1];
      px[i + 2] = cor[2];
      px[i + 3] = alfa;
    }
  }
  return px;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length, 0);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo), 0);
  return Buffer.concat([tamanho, corpo, crc]);
}

function png(tamanho) {
  const pixels = desenhar(tamanho);
  const bruto = Buffer.alloc((tamanho * 4 + 1) * tamanho);
  for (let y = 0; y < tamanho; y++) {
    bruto[y * (tamanho * 4 + 1)] = 0;
    pixels.copy(bruto, y * (tamanho * 4 + 1) + 1, y * tamanho * 4, (y + 1) * tamanho * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tamanho, 0);
  ihdr.writeUInt32BE(tamanho, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(bruto, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const destino = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(destino, { recursive: true });

for (const tamanho of [192, 512]) {
  const arquivo = path.join(destino, `icon-${tamanho}.png`);
  fs.writeFileSync(arquivo, png(tamanho));
  console.log(arquivo, fs.statSync(arquivo).size, "bytes");
}