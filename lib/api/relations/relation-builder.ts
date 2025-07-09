import { CrudConfig } from '../types';
import { RELATION_CONFIGS, getModelName, RelationKey } from './relation-configs';

export function buildIncludeObject<T>(config: CrudConfig<T>): any {
  if (!config.relations || config.relations.length === 0) {
    return {};
  }

  const modelName = getModelName(config.model);
  const modelConfig = RELATION_CONFIGS[modelName] || RELATION_CONFIGS.default;
  
  const include: any = {};
  
  for (const relationKey of config.relations) {
    const relationConfig = modelConfig[relationKey as RelationKey];
    
    if (relationConfig) {
      include[relationKey] = relationConfig;
    } else {
      // Fallback to simple boolean include for unknown relations
      include[relationKey] = true;
    }
  }
  
  return include;
}

export function buildSelectObject(fields: string[]): any {
  if (fields.length === 0) return {};
  
  const select: any = {};
  for (const field of fields) {
    select[field] = true;
  }
  return select;
}

export function buildWhereObject(filters: Record<string, any>): any {
  const where: any = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      where[key] = value;
    }
  }
  
  return where;
}

export function buildSearchWhere(search: string): any {
  if (!search) return {};
  
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };
} 