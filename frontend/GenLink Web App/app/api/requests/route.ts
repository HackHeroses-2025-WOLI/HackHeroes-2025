import { NextResponse } from "next/server";

type HelpRequestBody = {
  name: string;
  phone: string;
  city: string;
  problem: string;
};

const requiredFields: Array<keyof HelpRequestBody> = [
  "name",
  "phone",
  "city",
  "problem",
];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<HelpRequestBody>;

  const missingField = requiredFields.find((field) => !body[field]);

  if (missingField) {
    return NextResponse.json(
      { message: `Missing field: ${missingField}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "ok" }, { status: 201 });
}
