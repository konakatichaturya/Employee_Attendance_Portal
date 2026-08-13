import { mockServer } from '../mock/mockServer';
import type { Employee } from '../../types';

export const authApi = {
  requestLoginOtp(
    email: string,
    password: string,
    expectedRole?: Employee['role'],
  ): Promise<{ email: string; role: Employee['role']; devCode: string }> {
    return mockServer.requestLoginOtp(email, password, expectedRole);
  },
  verifyLoginOtp(email: string, code: string): Promise<{ token: string; employee: Employee }> {
    return mockServer.verifyLoginOtp(email, code);
  },
  register(input: {
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    password: string;
    managerId: string;
  }): Promise<{ token: string; employee: Employee }> {
    return mockServer.register(input);
  },
  logout(token: string): Promise<void> {
    return mockServer.logout(token);
  },
  changePassword(token: string, newPassword: string): Promise<Employee> {
    return mockServer.changePassword(token, newPassword);
  },
  getSessionEmployee(token: string): Promise<Employee> {
    return mockServer.getSessionEmployee(token);
  },
  getManagers(): Promise<{ id: string; name: string; department: string }[]> {
    return mockServer.getManagers();
  },
  createManager(
    adminToken: string,
    input: { employeeId: string; name: string; email: string; phone: string; department: string; password: string },
  ): Promise<Employee> {
    return mockServer.createManager(adminToken, input);
  },
  createEmployee(
    adminToken: string,
    input: {
      employeeId: string;
      name: string;
      email: string;
      phone: string;
      department: string;
      password: string;
      managerId: string;
    },
  ): Promise<Employee> {
    return mockServer.createEmployee(adminToken, input);
  },
};
