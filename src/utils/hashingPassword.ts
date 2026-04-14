import bcrypt from "bcrypt";

class HashPassword {
  private saltRounds = 10;

  async generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export default new HashPassword();