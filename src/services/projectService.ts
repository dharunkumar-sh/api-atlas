import type {
  ApiProject,
  CreateProjectInput,
  ProjectFilterOptions,
} from '@/types';
import { parseOpenApi } from '@/utils/openapi';
import { projectRepository } from '@/db';
import { dashboardOverviewSchema, type DashboardOverview } from '@/schemas/dashboard';

class ProjectService {
  public async listProjects(filter?: ProjectFilterOptions): Promise<ApiProject[]> {
    let result = await projectRepository.list();

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter?.tag) {
      result = result.filter((p) => p.tags.includes(filter.tag!));
    }

    if (filter?.specType) {
      result = result.filter((p) => p.specType === filter.specType);
    }

    return result;
  }

  public async getProjectById(id: string): Promise<ApiProject | null> {
    return await projectRepository.findById(id);
  }

  public async createProject(input: CreateProjectInput, userId?: string): Promise<ApiProject> {
    const parseResult = parseOpenApi(
      input.specContent,
      input.specFormat || 'auto'
    );
    const now = new Date().toISOString();
    const id = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const project: ApiProject = {
      id,
      name: input.name,
      description: input.description,
      version: parseResult.spec?.info.version || '1.0.0',
      specType: parseResult.spec?.specType || 'unknown',
      specFormat:
        parseResult.format === 'unknown' ? 'json' : parseResult.format,
      endpointsCount: parseResult.spec?.endpointsCount || 0,
      serversCount: parseResult.spec?.servers.length || 0,
      createdAt: now,
      updatedAt: now,
      tags: parseResult.spec?.tags.map((t) => t.name) || [],
      rawSpec: input.specContent,
      parsedSpec: parseResult.spec,
    };

    return await projectRepository.create(project, userId);
  }

  public async deleteProject(id: string): Promise<boolean> {
    return await projectRepository.deleteById(id);
  }

  public async count(): Promise<number> {
    return await projectRepository.count();
  }

  public async getDashboardOverview(): Promise<DashboardOverview> {
    const projects = await projectRepository.list();
    const totalSpecs = projects.length;
    const totalEndpoints = projects.reduce((acc, p) => acc + (p.endpointsCount || 0), 0);
    const totalServers = projects.reduce((acc, p) => acc + (p.serversCount || 0), 0);

    const formatsSet = new Set<string>();
    projects.forEach((p) => {
      if (p.specFormat) formatsSet.add(p.specFormat.toUpperCase());
    });
    const supportedFormats = formatsSet.size > 0 ? Array.from(formatsSet) : ['YAML', 'JSON'];

    const targetsSet = new Set<string>();
    projects.forEach((p) => {
      if (p.specType.includes('3_1')) targetsSet.add('v3.1');
      else if (p.specType.includes('3_0')) targetsSet.add('v3.0');
      else if (p.specType.includes('2_0')) targetsSet.add('v2.0');
    });
    const openApiTargets = targetsSet.size > 0 ? Array.from(targetsSet) : ['v3.0', 'v3.1'];

    const recentProjectsCount = projects.filter(
      (p) => Date.now() - new Date(p.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    const rawOverview = {
      metrics: {
        totalSpecs,
        supportedFormats,
        openApiTargets,
        validationStatus: (totalSpecs > 0 ? 'Active' : 'Idle') as 'Active' | 'Idle',
        totalEndpoints,
        totalServers,
      },
      recentProjectsCount,
      timestamp: new Date().toISOString(),
    };

    return dashboardOverviewSchema.parse(rawOverview);
  }
}

export const projectService = new ProjectService();
