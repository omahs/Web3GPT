import createResponse from "@/app/lib/helpers/createResponse";
import { deployContract } from "@/lib/contracts";
import { DeployResults } from "@/app/types/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    chains,
    sourceCode,
    constructorArgs = [],
  }: {
    name: string;
    chains: Array<string>;
    sourceCode: string;
    constructorArgs: Array<string | string[]>;
  } = body;

  const contractData = await Promise.all(
    chains.map(async (chain: string) => {
      const deploymentResponse: DeployResults = await deployContract(name, chain, sourceCode, constructorArgs);
      return deploymentResponse;
    })
  );

  return createResponse(200, {
    contracts: contractData,
  });
}

export async function OPTIONS() {
  return createResponse(200);
}
