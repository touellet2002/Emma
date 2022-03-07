package com.example.emmamobileapp.ui.auth.login;

import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.example.emmamobileapp.R;
import com.example.emmamobileapp.ui.auth.register.RegisterFragment;

public class LoginFragment extends Fragment {

    TextView loginRegisterLink;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        loginRegisterLink = view.findViewById(R.id.login_register_link);

        loginRegisterLink.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                FragmentTransaction fragmentTransaction = getActivity().getSupportFragmentManager().beginTransaction();
                fragmentTransaction.replace(R.id.authFragmentContainerView, new RegisterFragment());
                fragmentTransaction.commit();
            }
        });

        return view;
    }
}