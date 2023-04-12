export interface IPFArgs {
  ip: string;
  fingerprint: string;
}

export interface CArgs {
  card_number: string;
  card_expiry: string;
  card_cvc: string;
  card_name: string;
}

/**
 * @returns [deviation score, try counter]
 */
export interface CurrentScoresOutput {
  scores: [number, number];
}
