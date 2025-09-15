import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Survey, 
  SurveyCreate, 
  INSTATSurvey, 
  INSTATSurveyCreate, 
  INSTATSurveyUpdate,
  SurveyMetrics,
  INSTATDomain,
  SurveyCategory,
  WorkflowStatus,
  ReportingCycle
} from '../models/survey.model';
import { ApiResponse, PaginatedResponse, DeleteResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic Survey Operations
  createSurvey(schemaName: string, survey: SurveyCreate): Observable<ApiResponse<Survey>> {
    return this.http.post<ApiResponse<Survey>>(`${this.API_URL}/v1/api/surveys/${schemaName}`, survey);
  }

  getSurveys(schemaName: string, page: number = 1, limit: number = 100): Observable<PaginatedResponse<Survey>> {
    const params = new HttpParams()
      .set('skip', (page - 1) * limit)
      .set('limit', limit);

    return this.http.get<PaginatedResponse<Survey>>(`${this.API_URL}/v1/api/surveys/${schemaName}`, { params });
  }

  getSurvey(schemaName: string, surveyId: number): Observable<ApiResponse<Survey>> {
    return this.http.get<ApiResponse<Survey>>(`${this.API_URL}/v1/api/surveys/${schemaName}/${surveyId}`);
  }

  updateSurvey(schemaName: string, surveyId: number, survey: SurveyCreate): Observable<ApiResponse<Survey>> {
    return this.http.put<ApiResponse<Survey>>(`${this.API_URL}/v1/api/surveys/${schemaName}/${surveyId}`, survey);
  }

  deleteSurvey(schemaName: string, surveyId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/api/surveys/${schemaName}/${surveyId}`);
  }

  // INSTAT Survey Operations
  createINSTATSurvey(surveyData: INSTATSurveyCreate): Observable<ApiResponse<INSTATSurvey>> {
    return this.http.post<ApiResponse<INSTATSurvey>>(`${this.API_URL}/v1/api/instat/surveys`, surveyData);
  }

  getINSTATSurvey(surveyId: number): Observable<ApiResponse<INSTATSurvey>> {
    return this.http.get<ApiResponse<INSTATSurvey>>(`${this.API_URL}/v1/api/instat/surveys/${surveyId}`);
  }

  getINSTATSurveys(
    page: number = 1,
    limit: number = 100,
    filters?: {
      domain?: INSTATDomain;
      category?: SurveyCategory;
      status?: WorkflowStatus;
      fiscal_year?: number;
      reporting_cycle?: ReportingCycle;
    }
  ): Observable<PaginatedResponse<INSTATSurvey>> {
    let params = new HttpParams()
      .set('skip', (page - 1) * limit)
      .set('limit', limit);

    if (filters) {
      if (filters.domain) params = params.set('domain', filters.domain);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.fiscal_year) params = params.set('fiscal_year', filters.fiscal_year.toString());
      if (filters.reporting_cycle) params = params.set('reporting_cycle', filters.reporting_cycle);
    }

    return this.http.get<PaginatedResponse<INSTATSurvey>>(`${this.API_URL}/v1/api/instat/surveys`, { params });
  }

  updateINSTATSurvey(surveyId: number, surveyUpdate: INSTATSurveyUpdate): Observable<ApiResponse<INSTATSurvey>> {
    return this.http.put<ApiResponse<INSTATSurvey>>(`${this.API_URL}/v1/api/instat/surveys/${surveyId}`, surveyUpdate);
  }

  deleteINSTATSurvey(surveyId: number): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/api/instat/surveys/${surveyId}`);
  }

  // Survey Metrics
  getSurveyMetrics(surveyId: number): Observable<ApiResponse<SurveyMetrics>> {
    return this.http.get<ApiResponse<SurveyMetrics>>(`${this.API_URL}/v1/api/instat/surveys/${surveyId}/metrics`);
  }

  updateSurveyMetrics(surveyId: number, metrics: any): Observable<ApiResponse<SurveyMetrics>> {
    return this.http.put<ApiResponse<SurveyMetrics>>(`${this.API_URL}/v1/api/instat/surveys/${surveyId}/metrics`, metrics);
  }

  // Dashboard
  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/v1/api/instat/dashboard/summary`);
  }

  // File Upload
  uploadExcelAndCreateSurvey(
    file: File, 
    createTemplate: boolean = true, 
    templateName?: string, 
    schemaName?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('create_template', createTemplate.toString());
    
    if (templateName) {
      formData.append('template_name', templateName);
    }
    
    if (schemaName) {
      formData.append('schema_name', schemaName);
    }

    return this.http.post<any>(`${this.API_URL}/v1/files/upload-excel-and-create-survey`, formData);
  }

  uploadExcelAndCreateSurveyWithTemplate(
    file: File, 
    templateName: string, 
    schemaName?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template_name', templateName);
    
    if (schemaName) {
      formData.append('schema_name', schemaName);
    }

    return this.http.post<any>(`${this.API_URL}/v1/files/upload-excel-and-create-survey-with-template`, formData);
  }
}
