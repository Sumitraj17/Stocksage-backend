import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  } catch (error) {
    throw error;
  }
};

const comparePassword = async (hashedPassword, password) => {
  try {
    const isEqual = await bcrypt.compare(password, hashedPassword);
    return isEqual;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export {
  hashPassword,
  comparePassword
};
