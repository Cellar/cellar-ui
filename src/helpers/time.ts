export class Time {
  static Millisecond = 1;
  static Second = Time.Millisecond * 1000;
  static Minute = Time.Second * 60;
  static Hour = Time.Minute * 60;

  static fromString(time: string): [number, number] {
    const timeParts = time.split(':');
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Unable to parse time ${time}`);
    }
    return [hours % 12, minutes];
  }

  static toString(hours: number, minutes: number): string {
    if (hours === 0) {
      return `12:${minutes.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
}
