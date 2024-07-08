const messages = {
  paid: "Pagamento recebido. Veja sua compra",
  waiting: "Aguardando pagamento.",
  declined: "Pagamento não autorizado",
  expired: "Tempo esgotado. Gerando novo ticket..",
}

export const getMessage = (status: string) => {
  // @ts-ignore
  return messages[status.toLowerCase()] ?? ""
}
