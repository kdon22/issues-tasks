import { NextRequest, NextResponse } from 'next/server';
import { CrudConfig, ApiResponse } from '../types';
import { WorkspaceContext } from '../middleware/workspace-middleware';
import { buildIncludeObject, buildSearchWhere } from '../relations/relation-builder';

export abstract class BaseWorkspaceHandler<T> {
  constructor(protected config: CrudConfig<T>) {}

  protected buildInclude() {
    return buildIncludeObject(this.config);
  }

  protected buildCreateData(validatedData: any, context: WorkspaceContext): any {
    return {
      ...validatedData,
      workspaceId: context.workspace.id,
    };
  }

  protected async buildWorkspaceWhere(context: WorkspaceContext): Promise<any> {
    // Use the filter configuration to build workspace filtering
    if (this.config.filters?.default) {
      const apiContext = {
        userId: context.userId,
        workspaceId: context.workspace.id,
      };
      return await this.config.filters.default(apiContext);
    }
    
    // Fallback to direct workspaceId filtering for models that have it
    return { workspaceId: context.workspace.id };
  }

  protected async buildSearchWhere(search: string, context: WorkspaceContext): Promise<any> {
    const baseWhere = await this.buildWorkspaceWhere(context);
    const searchWhere = buildSearchWhere(search);
    
    if (Object.keys(searchWhere).length === 0) {
      return baseWhere;
    }
    
    return {
      ...baseWhere,
      ...searchWhere,
    };
  }

  protected buildPaginationParams(request: NextRequest) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    
    return { page, limit, search };
  }

  protected buildApiResponse<U>(data: U, meta?: any): ApiResponse<U> {
    return meta ? { data, meta } : { data };
  }

  // Override these methods for model-specific logic
  protected async beforeCreate(data: any, context: WorkspaceContext): Promise<any> {
    return data;
  }

  protected async afterCreate(data: T, context: WorkspaceContext): Promise<T> {
    return data;
  }

  protected async beforeUpdate(data: any, context: WorkspaceContext & { itemId: string }): Promise<any> {
    return data;
  }

  protected async afterUpdate(data: T, context: WorkspaceContext & { itemId: string }): Promise<T> {
    return data;
  }

  // Core CRUD operations
  async handleGet(context: WorkspaceContext, request: NextRequest): Promise<NextResponse> {
    const { page, limit, search } = this.buildPaginationParams(request);
    const where = await this.buildSearchWhere(search, context);
    const include = this.buildInclude();

    const [total, data] = await Promise.all([
      this.config.model.count({ where }),
      this.config.model.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    ]);

    const response = this.buildApiResponse(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });

    return NextResponse.json(response);
  }

  async handlePost(context: WorkspaceContext, request: NextRequest): Promise<NextResponse> {
    const body = await request.json();
    const validatedData = this.config.schema.create.parse(body);
    
    const createData = await this.beforeCreate(
      this.buildCreateData(validatedData, context),
      context
    );

    const data = await this.config.model.create({
      data: createData,
      include: this.buildInclude(),
    });

    const finalData = await this.afterCreate(data, context);
    const response = this.buildApiResponse(finalData);

    return NextResponse.json(response, { status: 201 });
  }

  async handleGetItem(context: WorkspaceContext & { itemId: string }): Promise<NextResponse> {
    const baseWhere = await this.buildWorkspaceWhere(context);
    const data = await this.config.model.findFirst({
      where: { 
        id: context.itemId,
        ...baseWhere,
      },
      include: this.buildInclude(),
    });

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const response = this.buildApiResponse(data);
    return NextResponse.json(response);
  }

  async handlePut(context: WorkspaceContext & { itemId: string }, request: NextRequest): Promise<NextResponse> {
    const baseWhere = await this.buildWorkspaceWhere(context);
    const existingItem = await this.config.model.findFirst({
      where: { 
        id: context.itemId,
        ...baseWhere,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = this.config.schema.update.parse(body);
    
    const updateData = await this.beforeUpdate(validatedData, context);

    const data = await this.config.model.update({
      where: { id: context.itemId },
      data: updateData,
      include: this.buildInclude(),
    });

    const finalData = await this.afterUpdate(data, context);
    const response = this.buildApiResponse(finalData);

    return NextResponse.json(response);
  }

  async handleDelete(context: WorkspaceContext & { itemId: string }): Promise<NextResponse> {
    const baseWhere = await this.buildWorkspaceWhere(context);
    const existingItem = await this.config.model.findFirst({
      where: { 
        id: context.itemId,
        ...baseWhere,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await this.config.model.delete({
      where: { id: context.itemId },
    });

    return NextResponse.json({ data: { success: true } });
  }
} 