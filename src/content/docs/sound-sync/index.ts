/**
 * Sound Sync State Documentation
 * Parsed from PROJECT ZYGA - SM documentation files
 */

export type DocumentSection = {
  id: string;
  title: string;
  content: string[];
};

export type StateDocument = {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  sections: DocumentSection[];
};

import { awakeFocusDoc } from "./awake-focus";
import { relaxedBodyDoc } from "./relaxed-body";
import { mabaDoc } from "./maba";
import { deepInnerDoc } from "./deep-inner";
import { integrationDoc } from "./integration";

export { awakeFocusDoc, relaxedBodyDoc, mabaDoc, deepInnerDoc, integrationDoc };

export const stateDocuments: Record<string, StateDocument> = {
  "awake-focus": awakeFocusDoc,
  "relaxed-body": relaxedBodyDoc,
  "maba": mabaDoc,
  "deep-inner": deepInnerDoc,
  "integration": integrationDoc,
};
