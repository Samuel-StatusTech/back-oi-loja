const messages = {
  approved: "Pagamento recebido. Veja sua compra",
  pending: "Processando pagamento.",
  waiting: "Aguardando pagamento.",
  denied: "Pagamento não autorizado",
  expired: "Tempo esgotado. Gerando novo ticket..",
}

export const getMessage = (status: string) => {
  // @ts-ignore
  return messages[status.toLowerCase()] ?? ""
}
