const unidades = [
  { id: "pol", nome: "Polegadas (pol)" },
  { id: "km",  nome: "Quilômetro (km)" },
  { id: "hm",  nome: "Hectômetro (hm)" },
  { id: "dam", nome: "Decâmetro (dam)" },
  { id: "m",   nome: "Metro (m)" },
  { id: "dm",  nome: "Decímetro (dm)" },
  { id: "cm",  nome: "Centímetro (cm)" },
  { id: "mm",  nome: "Milímetro (mm)" }
];

chrome.runtime.onInstalled.addListener(() => {
  // 1. Criar o Menu Principal (O nome da sua Extensão)
  chrome.contextMenus.create({
    id: "menu_principal",
    title: "Convertendo: '%s'",
    contexts: ["selection"]
  });

  // 2. Criar os Submenus de "DE" (Origem)
  unidades.forEach(unidade => {
    chrome.contextMenus.create({
      id: `de_${unidade.id}`,
      parentId: "menu_principal",
      title: `De: ${unidade.nome}`,
      contexts: ["selection"]
    });

    // 3. Criar as opções de "PARA" (Destino) para cada origem
    unidades.forEach(dest => {
      if (unidade.id !== dest.id) {
        chrome.contextMenus.create({
          id: `conv_${unidade.id}_para_${dest.id}`,
          parentId: `de_${unidade.id}`,
          title: `Para: ${dest.nome}`,
          contexts: ["selection"]
        });
      }
    });

    // 4. Adicionar a opção "Resumo Geral" no final de cada sublista
    chrome.contextMenus.create({
      id: `resumo_${unidade.id}`,
      parentId: `de_${unidade.id}`,
      title: "⭐ RESUMO GERAL",
      contexts: ["selection"]
    });
  });
});

// Funções de Cálculo
const taxasParaMetro = { km: 1000, hm: 100, dam: 10, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, pol: 0.0254 };

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const valor = parseFloat(info.selectionText.replace(',', '.'));
  if (isNaN(valor)) return;

  const [tipo, origem, , destino] = info.menuItemId.split('_');

  if (tipo === "conv") {
    const valorEmMetros = valor * taxasParaMetro[origem];
    const resultado = valorEmMetros / taxasParaMetro[destino];
    exibirAlerta(tab, `${valor} ${origem} = ${resultado.toLocaleString('pt-BR')} ${destino}`);
  } 
  
  if (tipo === "resumo") {
    const origemResumo = info.menuItemId.split('_')[1];
    const valorEmMetros = valor * taxasParaMetro[origemResumo];
    let resumo = `Resumo para ${valor}${origemResumo}:\n\n`;
    
    unidades.forEach(u => {
      if (u.id !== origemResumo) {
        const res = (valorEmMetros / taxasParaMetro[u.id]).toLocaleString('pt-BR');
        resumo += `• ${u.nome}: ${res}\n`;
      }
    });
    exibirAlerta(tab, resumo);
  }
});

function exibirAlerta(tab, msg) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (m) => alert(m),
    args: [msg]
  });
}