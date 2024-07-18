// npm
import * as dotenv from "dotenv";
dotenv.config();

// enums
import { AwsRegion, Stage } from "../enums";

export class Config {
  public stage: string;
  public awsRegion: string;
  public authorizationArn: string;
  public userPoolId: string;
  public wsAuthorizer: string;
  public wsEndpoint: string;
  public restApiId: string;
  public restApiRootResourceId: string;
  

  constructor(private readonly envStore = process.env) {
    this.stage = this.envVar("STAGE", false, Stage.Local) as string;
    this.awsRegion = this.envVar("REGION", false, AwsRegion.dev) as string;
    this.authorizationArn = this.envVar("AUTHORIZATION_ARN", false) as string;
    this.userPoolId = this.envVar("USER_POOL_ID", false) as string;
    this.wsAuthorizer = this.envVar("WS_AUTHORIZER", false) as string;
    this.wsEndpoint = this.envVar("WS_ENDPOINT", false) as string;
    this.restApiId = this.envVar("REST_API_ID", false) as string;
    this.restApiRootResourceId = this.envVar("REST_API_ROOT_RESOURCE_ID", false) as string;
  }

  private envVar(name: string, mandatory: boolean, defaultValue?: string | number): string | number | undefined {
    const value = this.envStore[name];
    if (typeof value === "undefined") {
      if (mandatory) {
        throw new Error(`Environment variable ${name} is required.`);
      } else {
        return defaultValue;
      }
    }
    return value;
  }
}

export const config = new Config();