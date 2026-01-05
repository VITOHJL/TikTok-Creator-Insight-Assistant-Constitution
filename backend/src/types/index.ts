export interface ScriptOutline {
  style: string;
  title?: string;
  points: string[];
  description?: string;
}

export interface HashtagSuggestion {
  text: string;
  relevance?: number;
  category?: string;
}

export interface MusicStyleSuggestion {
  style: string;
  mood?: string;
  tempo?: string;
  scene?: string;
}

export interface GenerationResult {
  scripts: ScriptOutline[];
  hashtags: HashtagSuggestion[];
  musicStyle: MusicStyleSuggestion;
}

