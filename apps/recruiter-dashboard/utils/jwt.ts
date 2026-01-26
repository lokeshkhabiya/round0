"use server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET! || "";

export const createJwt = async (payload: any) =>{
    const token = jwt.sign(payload,JWT_SECRET);
    return token;
}