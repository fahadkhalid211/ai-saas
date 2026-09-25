/** No imports on purpose: this is used by client code as well as the server. */
/** "Tell me everything", "what do you know", "what is this about": questions about the whole knowledge base, not a keyword in it. */
export function isAskAllQuery(query: string): boolean {
  return /\b(all you know|everything|what (?:do|can) you (?:know|tell|help)|tell me (?:more )?about (?:yourself|your (?:business|company|services|product)|it|this|the (?:company|business|product|service))|what(?:'s| is| are) (?:this|these|the (?:doc|document|documents|file|page)) (?:about|for)|what (?:do|does) (?:this|the) (?:company|business|site|website|product|service) do|what do you (?:have|offer|do)|who are you|introduce yourself|give me (?:an? )?(?:intro|introduction|idea|rundown|overview))\b/i.test(query);
}
