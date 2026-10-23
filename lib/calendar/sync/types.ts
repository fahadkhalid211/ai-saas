/** A busy period on an external calendar, as absolute UTC instants. Half-open: [startAt, endAt). */
export interface ExternalBlock {
  startAt: Date;
  endAt: Date;
}
