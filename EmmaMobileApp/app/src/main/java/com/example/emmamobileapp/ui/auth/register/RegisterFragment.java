package com.example.emmamobileapp.ui.auth.register;

import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import androidx.lifecycle.ViewModelProvider;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.emmamobileapp.R;
import com.example.emmamobileapp.ui.auth.login.LoginFragment;

public class RegisterFragment extends Fragment {

    TextView registerLoginLink;
    Button registerButton;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_register, container, false);

        RegisterViewModel viewModel = new ViewModelProvider(getActivity()).get(RegisterViewModel.class);

        viewModel.response.observe(getActivity(), response -> {
            Toast.makeText(getContext(), response.toString(), Toast.LENGTH_SHORT).show();
        });

        registerLoginLink = view.findViewById(R.id.register_login_link);
        registerLoginLink.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                FragmentTransaction fragmentTransaction = getActivity().getSupportFragmentManager().beginTransaction();
                fragmentTransaction.replace(R.id.authFragmentContainerView, new LoginFragment());
                fragmentTransaction.commit();
            }
        });

        registerButton = view.findViewById(R.id.register_button);
        registerButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                viewModel.register("test", "test@sdfs.com", "test");
            }
        });

        return view;
    }
}